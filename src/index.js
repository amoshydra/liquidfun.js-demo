import * as PIXI from 'pixi.js';
import Stats from 'stats.js';
const b2 = require ('lucy-b2');

import { LiquidfunRenderer } from './js/libs/liquidfun/LiquidfunRenderer.js';
import { LiquidfunSprite } from './js/libs/liquidfun/LiquidfunSprite.js';

PIXI.WebGLRenderer.registerPlugin('liquidfun', LiquidfunRenderer);

let sprites = [];
let world, particleSystem;
window.PTM = 20;
window.renderer;

let gravity = new b2.Vec2(0, -10);

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function createBox(x, y, w, h, fixed) {
    let bd = new b2.BodyDef();
    if (!fixed) {
        bd.type = 2;
    }
    bd.position = new b2.Vec2(x, y);

    let body = world.CreateBody(bd);

    let shape = new b2.PolygonShape;
    shape.SetAsBox(w, h);
    body.CreateFixture(shape, 1.0);

    let sprite = PIXI.Sprite.from(PIXI.Texture.WHITE);
    // dunno why this has to be times 2
    sprite.width = w * PTM * 2;
    sprite.height = h * PTM * 2;
    sprite.anchor.set(0.5);
    sprite.body = body;
    renderer.stage.addChild(sprite);
    sprites.push(sprite);
    return body;
}

function createParticleSystem() {
    let psd = new b2.ParticleSystemDef();
    psd.radius  = 0.1;
    particleSystem = world.CreateParticleSystem(psd);
    particleSystem.SetMaxParticleCount(5000);

    let dummy = PIXI.Sprite.from(PIXI.Texture.EMPTY);
    renderer.stage.addChild(dummy);

    const particleSystemSprite = new LiquidfunSprite(particleSystem);
    renderer.stage.addChild(particleSystemSprite);
}

function spawnParticles(radius, x, y) {
    let color = new b2.ParticleColor(0, 0, 255, 255);
    // flags
    let flags = (0<<0);

    let pgd = new b2.ParticleGroupDef();
    let shape = new b2.CircleShape();
    shape.m_radius  = radius;
    pgd.shape  = shape;
    pgd.color  = color;
    pgd.flags  = flags;
    shape.m_p  = new b2.Vec2(x, y);
    const group = particleSystem.CreateParticleGroup(pgd);
    return group;
}

function spawnRain() {
    let x = getRandom(-25, 25);
    let group = spawnParticles(0.09, x, 25);
    //group.ApplyLinearImpulse(wind);
}

function init() {
    // stats
    let stats = new Stats();
    document.body.appendChild(stats.domElement);

    // renderer
    let w = window.innerWidth;
    let h = window.innerHeight;
    window.renderer = new PIXI.Application(w, h, {backgroundColor : 0x8BB174});
    document.body.appendChild(renderer.view);

    //let killerShape = new b2.PolygonShape;
    //killerShape.SetAsBox(w, h);
    //let killerTransform = new b2.Transform;
    //killerTransform.Set(new b2.Vec2(0, 0), 0);

    // shift 0/0 to the center
    renderer.stage.position.x = w/2;
    renderer.stage.position.y = h/2;

    // world
    world = new b2.World(gravity);

    createBox(0, 0, 5, 1, true);

    createParticleSystem();

    renderer.ticker.add(function() {
        for (let i=0,s=sprites[i];i<sprites.length;s=sprites[++i]) {
            let pos = s.body.GetPosition();
            s.position.set(pos.x*PTM, -pos.y*PTM)
            s.rotation = -s.body.GetAngle();
        }
        stats.update();
    });

    // update loop
    function update() {
        //particleSystem.DestroyParticlesInShape(killerShape, killerTransform);
        world.Step(1/60, 8, 3);
    }
    window.setInterval(update, 1000 / 60);
    window.setInterval(spawnRain, 10);

    renderer.view.addEventListener("click", function(e) {
        let x = ((e.clientX - renderer.view.offsetLeft) - w/2) / PTM;
        let y = (-(e.clientY - renderer.view.offsetTop) + h/2) / PTM;
        if (e.shiftKey) {
            spawnParticles(1, x, y);
        } else {
            createBox(x, y, 1, 1, e.ctrlKey);
        }
    });
};

window.addEventListener("load", init);
