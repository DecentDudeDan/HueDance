export interface Light {
    id: string,
    state: {
        on: boolean,
        bri: number,
        hue: number,
        sat: number,
        effect: string,
        xy: Array<any>,
        ct: number,
        alert: string,
        colormode: string,
        mode: string,
        reachable: boolean
    },
    type: string,
    name: string,
    modelid: string,
    manfacturername: string,
    productname: string,
    uniqueid: string,
    swversion: string,
    enabled: boolean
}