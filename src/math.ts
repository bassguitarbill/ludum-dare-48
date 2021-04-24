class Vector2 {
  constructor(public x: number = 0, public y: number = 0) {}
  normalize(scale: number = 1): Vector2 {
    const lengthSquared = (this.x * this.x) + (this.y * this.y);
    if (lengthSquared === 0 || lengthSquared === scale) return this;
    // const scaleFactor = lengthSquared / scaleSquared;
    const scaleFactor = Math.sqrt(lengthSquared) / scale;
    return new Vector2(this.x / scaleFactor, this.y / scaleFactor);
  }
  add(x: number, y: number): void {
    this.x += x;
    this.y += y;
  }
  times(l: number): Vector2 {
    return new Vector2(this.x * l, this.y * l);
  }
  angle(): number {
    return Math.atan2(-this.y, this.x);
  }
  distanceSquared(v2: Vector2): number {
    const xDistance = this.x - v2.x;
    const yDistance = this.y - v2.y;
    return (xDistance * xDistance) + (yDistance * yDistance);
  }
  distanceBetween(v2: Vector2): number {
    return Math.sqrt(this.distanceSquared(v2));
  }
  dot(v2: Vector2): number {
    return (this.x * v2.x) + (this.y * v2.y); 
  }
  isZeroVector(): boolean {
    return this.x === 0 && this.y === 0;
  }
}

export { Vector2 };