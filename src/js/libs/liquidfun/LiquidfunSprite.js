import * as PIXI from 'pixi.js';

const loadShaders = async (obj) => Object.fromEntries(
  await Promise.all(
    Object
      .entries(obj)
      .map(async ([key, path]) => [
        key,
        (await import(
          /* webpackChunkName: "shaders/" */
          './shaders/' + path
        )).default
      ])
  )
);

export class LiquidfunSprite extends PIXI.Container {
  constructor(particleSystem, renderer) {
    super();

    this.renderer = renderer;
    this.particleSystem = particleSystem;

    this.renderLoop = () => {};
    this.setupShaders()
      .then(() => {
        this.renderLoop = this.render.bind(this);
      })
    ;
  }

  async setupShaders() {
    const shaders = await loadShaders({
      ballFrag: 'ball.fs.glsl',
      ballVert: 'ball.vs.glsl',
      identifyVert: 'identity.vs.glsl',
      blurFrag: 'blur.fs.glsl',
      thresholdFrag: 'threshold.fs.glsl',
    });

    this.ball_shader = new PIXI.glCore.GLShader(this.renderer.gl, shaders.ballVert, shaders.ballFrag);
    this.blur_shader = new PIXI.glCore.GLShader(this.renderer.gl, shaders.identifyVert, shaders.blurFrag);
    this.threshold_shader = new PIXI.glCore.GLShader(this.renderer.gl, shaders.identifyVert, shaders.thresholdFrag);
    this.pos_buffer = this.renderer.gl.createBuffer();
    this.color_buffer = this.renderer.gl.createBuffer();
    this.quadbuffer = this.renderer.gl.createBuffer();
  }

  _renderWebGL(renderer) {
    this.renderLoop(renderer);
  }

  render(renderer) {
    renderer.setObjectRenderer(renderer.plugins.liquidfun);
    renderer.plugins.liquidfun.render(this);
  }
}
