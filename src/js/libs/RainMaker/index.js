const getRandom = (min, max) => Math.random() * (max - min) + min;

export class RainMaker {
  constructor(particleSystem) {
    this.particleSystem = particleSystem;
  }

  spawnParticles(radius, x, y) {
    const color = new Box2D.b2ParticleColor(0, 0, 255, 255);
    // flags
    const flags = (0<<0);

    const pgd = new Box2D.b2ParticleGroupDef();
    const shape = new Box2D.b2CircleShape();
    shape.set_m_radius(radius);
    pgd.set_shape(shape);
    pgd.set_color(color);
    pgd.set_flags(flags);
    shape.set_m_p(new Box2D.b2Vec2(x, y));
    return this.particleSystem.CreateParticleGroup(pgd);
  }

  spawnRain() {
    const x = getRandom(-25, 25);
    return this.spawnParticles(0.09, x, 25);
  }
}


