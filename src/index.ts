import * as PIXI from "pixi.js";
// import MapData from "../assets/testmap.json";
import MapData from "../assets/testmap3.json";
import TileData from "../assets/terrain.json";
import CoinTileData from "../assets/coin_gold.json";
import { Tileset } from "./tilemap/tileset";
import { Tilemap, TILED_RENDER_ORDER } from "./tilemap/tilemap";
import { ITiledTileset } from "tiled";

// PIXI.settings.ROUND_PIXELS = true;
// PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
const app = new PIXI.Application({
    // antialias: true
    resizeTo: window,
    // resolution: 0.25
});


document.body.appendChild(app.view);

const mapMove = [ Math.random() * -1, Math.random() ];
let tileX = 0;
let tileY = 0;

// app.loader.add("tileset", "./assets/LPC_Terrain/terrain.png")
app.loader.add("tileset", `./assets/${TileData.image}`)
    .add("cointileset", `./assets/${CoinTileData.image}`)
    .load((loader, resources) => {
        // Load the Tileset Texture Atlas
        const sheet = resources.tileset!.texture;
        const coinSheet = resources.cointileset!.texture;

        const tileset = Tileset.fromTiledFile(TileData as ITiledTileset, sheet);
        const tileset2 = Tileset.fromTiledFile(CoinTileData as ITiledTileset, coinSheet);

        const tilemap = new Tilemap({
            height: MapData.height,
            width: MapData.width,
            tileWidth: MapData.tilewidth,
            tileHeight: MapData.tileheight,
            layers: MapData.layers,
            renderOrder: MapData.renderorder as TILED_RENDER_ORDER,
            tilesets: MapData.tilesets
        }, { 
            "terrain": tileset,
            "coin_gold": tileset2
        }, app.renderer);

        app.stage.addChild(tilemap.container);
        // const coin = tileset2.getTile(3) as PIXI.AnimatedSprite;
        // coin.play();
        // console.log(coin);
        // app.stage.addChild(coin);
        

        console.log(tilemap.container);

        const minX = -1 *((MapData.tilewidth * MapData.width) - app.renderer.screen.width)
        const miny = -1 *((MapData.tileheight * MapData.height) - app.renderer.screen.height)
        
        let isDragging = false;
        let lastPosition: any = null;
        let moveToPosition: any = null;
        
        app.ticker.add(() => {
            tileX += mapMove[0];
            tileY += mapMove[1];

            if (isDragging) {
                if (lastPosition !== null && moveToPosition !== null) {
                    const dX = moveToPosition.x - lastPosition.x;
                    const dY = moveToPosition.y - lastPosition.y;
                    if (isNaN(dX) || isNaN(dY)) return;

                    lastPosition = moveToPosition;
                    moveToPosition = false;
                    tilemap.container.x += dX;
                    tilemap.container.y += dY;
                }
            }
        })

        // @ts-ignore
        window.pixi = PIXI;
        // @ts-ignore
        window.app = app;

        // @ts-ignore
        window.tilemap = tilemap;

        tilemap.container.on("pointerdown", (e: PIXI.interaction.InteractionEvent) => {
            isDragging = true;
            lastPosition = e.data.getLocalPosition(tilemap.container.parent);
        });

        tilemap.container.on("pointerup", (e: PIXI.interaction.InteractionEvent) => {
            isDragging = false;
            lastPosition = null;
            moveToPosition = null;
        });

        tilemap.container.on("pointerupoutside", (e: PIXI.interaction.InteractionEvent) => {
            isDragging = false;
            lastPosition = null;
            moveToPosition = null;
        });

        tilemap.container.on("pointermove", (e: PIXI.interaction.InteractionEvent) => {
            if (isDragging) {
                const tempPosition = e.data.getLocalPosition(tilemap.container.parent);
                if (Math.abs(tempPosition.x - lastPosition.x) > 5 ||
                    Math.abs(tempPosition.y - lastPosition.y) > 5) {
                        moveToPosition = tempPosition
                    } 
            }
        })
    });
