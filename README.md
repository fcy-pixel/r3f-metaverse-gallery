# R3F Metaverse Gallery

Minecraft-inspired 3D gallery built with React Three Fiber, Three.js, Vite, and Zustand.

## Features

- Single-level zoned gallery layout
- Minecraft-style voxel floors, walls, lighting, and display zones
- First-person movement with keyboard and drag-look
- Mobile joystick support
- Upload PNG/JPG images into gallery frames
- Shared online artwork storage with Cloudflare Pages Functions and KV
- Looping background music with an in-game on/off control
- Click artwork to focus/zoom inside the 3D scene

## Development

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

## Cloudflare Pages Deploy

```sh
npm run build
wrangler pages deploy dist --project-name r3f-metaverse-gallery
```

Uploaded artworks are stored in the `GALLERY_ARTWORKS` KV namespace configured in `wrangler.toml`, so all visitors see the same gallery state on the deployed site.

Background music is loaded from `public/background-music.mp3`. Use a file that you have permission to publish; the local MP3 is ignored by Git by default.
