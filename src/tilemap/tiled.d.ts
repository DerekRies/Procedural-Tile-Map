declare module "tiled" {
    export type TiledOrientation = "orthogonal" | "isometric" | "staggered" | "hexagonal"
    export type TiledRenderOrder = "right-down" | "right-up" | "left-down" | "left-up"

    export interface IPropertyDescriptor {
        name: string
        type: string
        value: any
    }

    export interface ITiledTileOffset {
        x: number
        y: number
    }

    export interface ITiledPoint {
        x: number
        y: number
    }

    export interface ITiledLayer {
        /**
         * Row count. Same as map height for fixed-size maps
         */
        height: number
        /**
         * Incremental id. Unique across all layers
         */
        id: number
        /**
         * Name given to the layer
         */
        name: string
        /**
         * Horizontal layer offset in pixels
         */
        offsetx: number
        /**
         * Vertical layer offset in pixels
         */
        offsety: number
        opacity: number
        properties: IPropertyDescriptor[]
        /**
         * X Coordinate where layer content starts (for infinite maps)
         */
        startx?: number
        /**
         * Y Coordinate where layer content starts (for infinite maps)
         */
        starty?: number
        /**
         * Whether layer is shown or hidden in the editor
         */
        visible: boolean
        /**
         * Column count. Same as map width for fixed-size maps
         */
        width: number
        /** Horizontal layer offset in tiles. Always 0 */
        x: number
        /** Vertical layer offset in tiles. Always 0 */
        y: number
        type: "tilelayer" | "objectgroup" | "imagelayer" | "group"
    }

    export interface ITiledChunk {
        data: number[]
        /**
         * Height in tiles
         */
        height: number
        /**
         * Width in tiles
         */
        width: number
        x: number
        y: number
    }

    export interface ITiledTileLayer extends ITiledLayer {
        chunks?: ITiledChunk[]
        compression?: "zlib" | "gzip"
        data: number[]
        encoding?: "csv" | "base64"
        type: "tilelayer"
    }

    export function isTiledTileLayer (layer: ITiledLayer) : layer is ITiledTileLayer {
        return layer.type === "tilelayer";
    }

    export interface ITiledText {
        bold?: boolean
        color?: string
        fontfamily?: string
        halign?: "center" | "right" | "justify" | "left"
        italic?: boolean
        kerning?: boolean
        pixelsize?: number
        strikeout?: boolean
        text: string
        underline?: boolean
        valign?: "center" | "bottom" | "top"
        wrap?: boolean
    }

    export interface ITiledObject {
        ellipse: boolean
        gid: number
        height: number
        id: number
        name: string
        point: boolean
        polygon: ITiledPoint[]
        polyline: ITiledPoint[]
        properties?: IPropertyDescriptor[]
        rotation: number
        template: string
        text: string
        type: string
        visible: boolean
        width: number
        x: number
        y: number
    }

    export interface ITiledObjectLayer extends ITiledLayer {
        draworder?: "topdown" | "index"
        type: "objectgroup"
        objects: ITiledObject[]
    }

    export function isTiledObjectLayer (layer: ITiledLayer) : layer is ITiledObjectLayer {
        return layer.type === "objectgroup";
    }

    export interface ITiledGroupLayer extends ITiledLayer {
        type: "group"
        layers?: ITiledLayer[]
    }

    export function isTiledGroupLayer (layer: ITiledLayer) : layer is ITiledGroupLayer {
        return layer.type === "group";
    }

    export interface ITiledImageLayer extends ITiledLayer {
        type: "imagelayer"
        image: string
        transparentcolor?: string
    }

    export function isTiledImageLayer (layer: ITiledLayer) : layer is ITiledImageLayer {
        return layer.type === "imagelayer";
    }

    export interface ITiledFrame {
        /**
         * Frame duration in milliseconds
         */
        duration: number
        /**
         * Local tile ID representing this frame
         */
        tileid: number
    }

    export interface ITiledTile {
        animation?: ITiledFrame[]
        id: number
        image?: string
        imageheight?: number
        imagewidth?: number
        objectgroup?: ITiledObjectLayer
        probability?: number
        properties?: IPropertyDescriptor[]
        terrain?: number[]
        type?: string
    }

    export interface ITiledTerrain {
        name: string
        tile: number
        properties?: IPropertyDescriptor[]
    }

    export interface ITiledTileset {
        backgroundcolor?: string
        columns: number
        grid?: any
        image: string
        imageheight: number
        imagewidth: number
        margin: number
        name: string
        properties: IPropertyDescriptor[]
        spacing: number
        terrains?: any[]
        tilecount: number
        tiledversion: string
        tileheight: number
        tileoffset?: ITiledTileOffset
        tiles: ITiledTile[]
        tilewidth: number
        transparentcolor?: string
        type: "tileset"
        version: number
        wangsets?: any[]
    }

    export interface ITiledTilesetShort {
        source: string
        firstgid: number
    }

    export interface ITiledMap {
        /**
         * Hex-formatted color
         */
        backgroundcolor?: string
        compressionlevel?: number
        editorsettings: any
        /**
         * Number of tile rows
         */
        height: number
        /**
         * Length of the side of a hex tile in pixels (hexagonal maps only)
         */
        hexsidelength?: number
        /**
         * Whether the map has infinite dimensions
         */
        infinite: boolean
        layers: ITiledLayer[]
        /**
         * Auto increments for each layer
         */
        nextlayerid: number
        /**
         * Auto increments for each placed object
         */
        nextobjectid: number
        orientation: TiledOrientation
        properties: IPropertyDescriptor[]
        /**
         * Orthogonal maps only
         */
        renderorder?: TiledRenderOrder
        /**
         * Staggered/Hexagonal maps only
         */
        staggeraxis?: "x" | "y"
        /**
         * Staggered/Hexagonal maps only
         */
        staggerindex?: "odd" | "even"
        /**
         * The version of Tiled used to save this file
         */
        tiledversion: string
        /**
         * Map grid height
         */
        tileheight: number
        tilesets: ITiledTileset[]
        /**
         * Map grid width
         */
        tilewidth: number
        /**
         * Since Tiled 1.0
         */
        type?: "map"
        /**
         * The JSON format version
         */
        version: number
        /**
         * Number of tile columns
         */
        width: number
    }

}

