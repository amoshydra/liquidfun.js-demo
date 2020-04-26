import * as PIXI from 'pixi.js';
import { PTM } from '../PTM';

export const syncBoxPhysics = (sprite) => {
  const pos = sprite.body.GetPosition();
  sprite.position.set(pos.get_x() * PTM, -pos.get_y() * PTM);
  sprite.rotation = -sprite.body.GetAngle();
};

export class BoxFactory {
  constructor(option) {
    this.sprites = [];

    this.stage = option.stage;
    this.world = option.world;
  }

  create(x, y, w, h, fixed = true) {
    // Create physics
    const bd = new Box2D.b2BodyDef();
    if (!fixed) {
      bd.set_type(2);
    }
    bd.set_position(new Box2D.b2Vec2(x, y));

    const body = this.world.CreateBody(bd);

    const shape = new Box2D.b2PolygonShape;
    shape.SetAsBox(w, h);
    body.CreateFixture(shape, 1.0);

    // Create render
    const sprite = PIXI.Sprite.from(PIXI.Texture.WHITE);

    // dunno why this has to be times 2
    sprite.width = w * PTM * 2;
    sprite.height = h * PTM * 2;
    sprite.anchor.set(0.5);
    sprite.body = body;

    this.stage.addChild(sprite);
    this.sprites.push(sprite);
    return sprite;
  }
}