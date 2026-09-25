#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_tint;

// One translucent sheet. Its centre line and thickness drift with x and time. Returns
// (body, edge): a faint fill that brightens toward its upper fold, and thin glowing edges.
vec2 ribbon(vec2 p, float base, float phase, float amplitude, float thickness, float speed) {
  float t = u_time * speed;
  float center = base
    + amplitude * sin(p.x * 2.2 + t + phase)
    + amplitude * 0.45 * sin(p.x * 4.3 - t * 1.3 + phase * 1.7);
  float halfWidth = thickness * (0.6 + 0.4 * sin(p.x * 1.1 - t * 0.6 + phase * 2.3));
  float d = p.y - center;

  float inside = 1.0 - smoothstep(halfWidth * 0.8, halfWidth, abs(d));
  float body = inside * mix(0.015, 0.1, smoothstep(-halfWidth, halfWidth, d));

  float top = abs(d - halfWidth);
  float bottom = abs(d + halfWidth);
  float edge = 0.5 * exp(-top * 260.0) + 0.1 * exp(-top * 30.0) + 0.18 * exp(-bottom * 300.0);
  return vec2(body, edge);
}

void main() {
  // y runs 0 (bottom) to 1 (top); x uses the same scale, so waves keep their shape at any aspect.
  vec2 p = gl_FragCoord.xy / u_resolution.y;

  vec2 a = ribbon(p, 0.40, 0.0, 0.055, 0.075, 0.10);
  vec2 b = ribbon(p, 0.36, 2.4, 0.045, 0.05, 0.07);
  vec2 c = ribbon(p, 0.44, 4.1, 0.065, 0.03, 0.13);

  float alpha = clamp(a.x + b.x + c.x + a.y + b.y + c.y, 0.0, 0.9);
  vec3 color = mix(u_tint, vec3(1.0), 0.35);
  gl_FragColor = vec4(color * alpha, alpha); // Premultiplied, to composite over the CSS gradient.
}
