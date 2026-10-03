export function applyGrainRows(data, width, height, from = 0, to = height) {
  for (let y = from; y < Math.min(to, height); y++) {
    const ny = y / height * Math.PI * 2;
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const nx = x / width * Math.PI * 2;
      const noise = (Math.sin(nx * 4) * Math.cos(ny * 4) + Math.sin(nx * 8 + ny * 8) * 0.4) * 3.5;
      data[idx] = Math.min(255, Math.max(0, data[idx] + noise * 0.7));
      data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + noise));
      data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + noise * 0.5));
    }
  }
}
