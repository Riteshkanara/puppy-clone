// Puppies shown as "doors" in the Home → Meet the pups section.
// Extracted from the saved original index.html (server-rendered markup). Order is the original's.
export interface HomeDoor {
  slug: string
  /** Door colour (CSS custom property --door). */
  door: string
  name: string
  meta: string
  status: string
  src: string
  alt: string
  pos: string
  color: string
}

/** Paw-print path used for the door peephole. */
export const peepholePath =
  "M32 30.5c-7.6 0-15.6 8.3-15.6 15.5 0 5.4 4.2 8.3 9.2 8.3 2.6 0 4.5-1.1 6.4-1.1s3.8 1.1 6.4 1.1c5 0 9.2-2.9 9.2-8.3 0-7.2-8-15.5-15.6-15.5zM19.28 26.71C21.07 30.08 20.42 33.92 17.84 35.29C15.25 36.67 11.71 35.05 9.92 31.69C8.13 28.32 8.78 24.48 11.36 23.11C13.95 21.73 17.49 23.35 19.28 26.71ZM29.62 15.64C30.32 19.62 28.46 23.26 25.47 23.79C22.48 24.32 19.48 21.53 18.78 17.56C18.08 13.58 19.94 9.94 22.93 9.41C25.92 8.88 28.92 11.67 29.62 15.64ZM45.22 17.56C44.52 21.53 41.52 24.32 38.53 23.79C35.54 23.26 33.68 19.62 34.38 15.64C35.08 11.67 38.08 8.88 41.07 9.41C44.06 9.94 45.92 13.58 45.22 17.56ZM54.08 31.69C52.29 35.05 48.75 36.67 46.16 35.29C43.58 33.92 42.93 30.08 44.72 26.71C46.51 23.35 50.05 21.73 52.64 23.11C55.22 24.48 55.87 28.32 54.08 31.69Z"

export const doors: HomeDoor[] = [
  {"slug": "maltipoo-max-male", "door": "#a24a1a", "name": "Max", "meta": "Maltipoo, boy, 3 months, with video", "status": "Available", "src": "/media/Z0ToauDx7Eve/5fffe4d022/b942a5_4b8cfb8204d24eadaf524332aba1dc15-mv2.webp", "alt": "Max, male Maltipoo puppy", "pos": "53.8% 44.3%", "color": "#785838"},
  {"slug": "korean-teacup-maltipoo-female", "door": "#5a3a28", "name": "Korean Teacup Maltipoo", "meta": "girl, 2 months, with video", "status": "Available", "src": "/media/gAaGwoGej2g6/5523e884dd/b942a5_50f0ae67c9ff437d911597d52a9e63b3-mv2.jpg", "alt": "Female Korean Teacup Maltipoo puppy", "pos": "52.5% 42.6%", "color": "#e8e8e8"},
  {"slug": "korean-teacup-poodle-female", "door": "#d4893f", "name": "Korean Teacup Poodle", "meta": "girl, 2 months", "status": "Available", "src": "/media/xeMJCapr5vcU/e618c653b2/b942a5_14376a216177484dbbb27995d0f6aeb7-mv2.jpg", "alt": "Female Korean Teacup Poodle puppy", "pos": "54.5% 45.7%", "color": "#f8d8b8"},
  {"slug": "maltipoo-cavapoo-male", "door": "#b8644a", "name": "Maltipoo & Cavapoo", "meta": "boy, 3 months Maltipoo & 2 months Cavapoo, with video", "status": "Available", "src": "/media/YQhey4j7uWvZ/3ea10db6c1/b942a5_7ce7e7bd18424b6c8fb16dd30113ade2-mv2.jpg", "alt": "Male Maltipoo & Cavapoo puppy", "pos": "44.7% 29.5%", "color": "#b8a8a8"},
  {"slug": "toy-poodle-male-female", "door": "#7a4a2e", "name": "Toy Poodle", "meta": "boy & girl, 2 months", "status": "Available", "src": "/media/vMu0BPvkAZ-j/c65e53967d/b942a5_0b2c0c0d178c4005acbe28725a5ea573-mv2.jpg", "alt": "Toy Poodle puppy", "pos": "65.4% 44.7%", "color": "#c8c8c8"},
  {"slug": "maltipoo-female-2", "door": "#a24a1a", "name": "Maltipoo", "meta": "girl, 3 months, with video", "status": "Available", "src": "/media/3WJNmn6VVgVu/732f779474/b942a5_2b5dcece361b4589890ae920c66a1b70-mv2.jpg", "alt": "Female Maltipoo puppy", "pos": "64.6% 42.3%", "color": "#080808"},
  {"slug": "pomeranian-female", "door": "#5a3a28", "name": "Pomeranian", "meta": "girl, 3 months", "status": "Available", "src": "/media/3yOfnmoyPooH/81e0c7e00c/b942a5_556841b9a73942e5a9d782a683f3bc68-mv2.jpg", "alt": "Female Pomeranian puppy", "pos": "40.3% 44.3%", "color": "#080808"},
  {"slug": "copper-male", "door": "#d4893f", "name": "Copper", "meta": "Cavapoo, boy, 2 months", "status": "Available", "src": "/media/O-6w4FYqE10j/be76f399cc/b942a5_bb73ebbb952047988f944f3a8e3052bd-mv2.jpg", "alt": "Copper, male Cavapoo puppy", "pos": "43.0% 50.5%", "color": "#e8d8c8"},
  {"slug": "shitzu-female", "door": "#b8644a", "name": "Shih Tzu", "meta": "girl, 2 months", "status": "Available", "src": "/media/qNrTCSrsYyzY/168fa8c4ff/b942a5_eb14616c76c24da89afe7fa3b7d7ae6a-mv2.jpeg", "alt": "Female Shih Tzu puppy", "pos": "44.8% 42.5%", "color": "#383848"},
  {"slug": "shitzu-male", "door": "#7a4a2e", "name": "Shih Tzu", "meta": "boy, 2 months", "status": "Available", "src": "/media/crgs9ih6as_M/e37bafb1bf/b942a5_344e49c6c34940d2b09a3ddd5c2e3234-mv2.jpg", "alt": "Male Shih Tzu puppy", "pos": "40.3% 43.6%", "color": "#787888"},
  {"slug": "maltipoo-female-1", "door": "#a24a1a", "name": "Maltipoo", "meta": "girl, 2.5 months", "status": "Available", "src": "/media/wNm2_VIBEQvK/4b68f59e75/b942a5_7dd33c9b78c04f78a6a1c7386fb55620-mv2.jpg", "alt": "Female Maltipoo puppy", "pos": "47.5% 50.5%", "color": "#e8d8c8"},
  {"slug": "maltipoo-female", "door": "#5a3a28", "name": "Maltipoo", "meta": "girl, 2 months", "status": "Available", "src": "/media/lMhASnmIIVQ4/ad2353ad31/b942a5_6a5617708d75408b8f73725080ed0149-mv2.jpg", "alt": "Female Maltipoo puppy", "pos": "56.9% 49.2%", "color": "#e8d8c8"},
  {"slug": "korean-teacup-pomeranian-1", "door": "#d4893f", "name": "Korean Teacup Pomeranian", "meta": "girl, 2 months", "status": "Available", "src": "/media/EsAq2LSRvVCJ/4d553ed044/b942a5_a8d264c1aa754d80bc7c98917dfd1fda-mv2.jpg", "alt": "Female Korean Teacup Pomeranian puppy", "pos": "49.9% 51.3%", "color": "#d8d8d8"},
  {"slug": "korean-teacup-pomeranian", "door": "#b8644a", "name": "Korean Teacup Pomeranian", "meta": "girl, 2 months", "status": "Available", "src": "/media/vzf7P8SPCZ-Q/a8db4ee114/b942a5_967bb346583b4146acb56607f5da5f21-mv2.jpg", "alt": "Female Korean Teacup Pomeranian puppy", "pos": "49.9% 48.6%", "color": "#484848"},
  {"slug": "korean-teacup-pomeranian-male", "door": "#7a4a2e", "name": "Korean Teacup Pomeranian", "meta": "boy, 2 months", "status": "Available", "src": "/media/nZTGFv46hrZI/fb9eeefc9c/b942a5_dcb8eb174915463ea0c40c58b7b0e406-mv2.jpg", "alt": "Male Korean Teacup Pomeranian puppy", "pos": "48.9% 44.1%", "color": "#080808"},
]
