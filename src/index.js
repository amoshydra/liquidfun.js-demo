import * as PIXI from 'pixi.js';
import Stats from 'stats.js';
import { LiquidfunRenderer } from './js/libs/liquidfun/LiquidfunRenderer.js';
import { LiquidfunSprite } from './js/libs/liquidfun/LiquidfunSprite.js';
import { RainMaker } from './js/libs/RainMaker';
import { BoxFactory, syncBoxPhysics } from './js/libs/BoxFactory';
import { PTM } from './js/libs/PTM';

PIXI.WebGLRenderer.registerPlugin('liquidfun', LiquidfunRenderer);

let world;
let pixiApp;
let gravity = new Box2D.b2Vec2(0, -10);

function createParticleSystem() {
  let psd = new Box2D.b2ParticleSystemDef();
  psd.set_radius(0.1);
  const particleSystem = world.CreateParticleSystem(psd);
  particleSystem.SetMaxParticleCount(5000);

  let dummy = PIXI.Sprite.from(PIXI.Texture.EMPTY);
  pixiApp.stage.addChild(dummy);

  const particleSystemSprite = new LiquidfunSprite(particleSystem, pixiApp.renderer);
  pixiApp.stage.addChild(particleSystemSprite);
  return particleSystem;
}

function init() {
  // stats
  let stats = new Stats();
  document.body.appendChild(stats.domElement);

  // renderer
  let w = window.innerWidth;
  let h = window.innerHeight;
  pixiApp = new PIXI.Application(w, h, {backgroundColor : 0x8BB174});
  document.body.appendChild(pixiApp.view);

  //let killerShape = new Box2D.b2PolygonShape;
  //killerShape.SetAsBox(w, h);
  //let killerTransform = new Box2D.b2Transform;
  //killerTransform.Set(new Box2D.b2Vec2(0, 0), 0);

  // shift 0/0 to the center
  pixiApp.stage.position.x = w/2;
  pixiApp.stage.position.y = h/2;

  // world
  world = new Box2D.b2World(gravity);

  const boxFactory = new BoxFactory({
    stage: pixiApp.stage,
    world,
  });

  boxFactory.create(0, 0, 5, 1, true);

  pixiApp.ticker.add(() => {
    boxFactory.sprites.forEach(syncBoxPhysics);
    stats.update();
  });

  // update loop
  function update() {
    //particleSystem.DestroyParticlesInShape(killerShape, killerTransform);
    world.Step(1/60, 8, 3);
  }

  const particleSystem = createParticleSystem();
  const rainMaker = new RainMaker(particleSystem);

  window.setInterval(update, 1000 / 60);
  window.setInterval(() => {
    rainMaker.spawnRain();
  }, 10);

  pixiApp.view.addEventListener('click', function(e) {
    let x = ((e.clientX - pixiApp.view.offsetLeft) - w/2) / PTM;
    let y = (-(e.clientY - pixiApp.view.offsetTop) + h/2) / PTM;
    if (e.shiftKey) {
      rainMaker.spawnParticles(1, x, y);
    } else {
      boxFactory.create(x, y, 1, 1, e.ctrlKey);
    }
  });
}

window.addEventListener('load', init);
