import * as PIXI from 'pixi.js';
import Stats from 'stats.js';
import { LiquidfunRenderer } from './js/libs/liquidfun/LiquidfunRenderer.js';
import { LiquidfunSprite } from './js/libs/liquidfun/LiquidfunSprite.js';
import { RainMaker } from './js/libs/RainMaker';
import { BoxFactory, syncBoxPhysics } from './js/libs/BoxFactory';
import { PTM } from './js/libs/PTM';
import { controlPanel } from './js/libs/PanelGUI';

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
  pixiApp = new PIXI.Application(w, h, { backgroundColor : 0x091425 });
  document.body.appendChild(pixiApp.view);

  // shift 0/0 to the center
  pixiApp.stage.position.x = w / 2;
  pixiApp.stage.position.y = h / 2;

  // world
  world = new Box2D.b2World(gravity);

  const boxFactory = new BoxFactory({
    stage: pixiApp.stage,
    world,
  });

  boxFactory.create(0, -h / 2.5 / PTM, w / 4 / PTM, 0.25, true);

  pixiApp.ticker.add(() => {
    boxFactory.sprites.forEach(syncBoxPhysics);
    stats.update();
  });

  // update loop
  const msPerFrame = 1/60;
  function update() {
    //particleSystem.DestroyParticlesInShape(killerShape, killerTransform);
    world.Step(msPerFrame, 8, 3);
  }

  const particleSystem = createParticleSystem();
  const rainMaker = new RainMaker(particleSystem);

  const config = {
    spawnSize: 1,
    _maxParticleCount: 5000,
    set maxParticleCount(count) {
      config._maxParticleCount = count;
      particleSystem.SetMaxParticleCount(count);
    },
    get maxParticleCount() {
      return config._maxParticleCount;
    }
  };
  controlPanel.add(config, 'spawnSize', 0.09, 6, 0.01);
  controlPanel.add(config, 'maxParticleCount', 1, 10000);

  window.setInterval(update, 1000 / 60);
  window.setInterval(() => {
    rainMaker.spawnRain();
  }, 10);

  pixiApp.view.addEventListener('click', function(e) {
    let x = ((e.clientX - pixiApp.view.offsetLeft) - w/2) / PTM;
    let y = (-(e.clientY - pixiApp.view.offsetTop) + h/2) / PTM;
    if (e.shiftKey) {
      rainMaker.spawnParticles(config.spawnSize, x, y);
    } else {
      boxFactory.create(x, y, 1, 1, e.ctrlKey);
    }
  });
}

window.addEventListener('load', init);
