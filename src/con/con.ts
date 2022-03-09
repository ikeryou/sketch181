import { Func } from '../core/func';
import { Canvas } from '../webgl/canvas';
import { Object3D } from 'three/src/core/Object3D';
import { Conf } from '../core/conf';
import { Color } from "three/src/math/Color";
import { PlaneGeometry } from "three/src/geometries/PlaneGeometry";
import { MeshBasicMaterial } from "three/src/materials/MeshBasicMaterial";
import { Mesh } from 'three/src/objects/Mesh';
import { Mouse } from '../core/mouse';
import { Util } from '../libs/util';

export class Con extends Canvas {

  private _con: Object3D;
  private _item:Array<Mesh> = []

  // コンソール結果を一時的に入れておく
  private _temp:Array<any> = []

  constructor(opt: any) {
    super(opt);

    this._con = new Object3D()
    this.mainScene.add(this._con)

    // 共通ジオメトリ
    const geo = new PlaneGeometry(1,1)

    // アイテム作成
    const num = 40
    for(let i = 0; i < num; i++) {
      const item = new Mesh(
        geo,
        new MeshBasicMaterial({
          color:0xff0000,
          transparent:true
        })
      )
      this._con.add(item)
      this._item.push(item)
    }

    this._resize()
  }


  protected _update(): void {
    super._update()
    this._con.position.y = Func.instance.screenOffsetY() * -1

    // コンソール出力
    let mx = (Mouse.instance.easeNormal.x + 1) * 0.5
    // let my = (Mouse.instance.easeNormal.y + 1) * 0.5

    const fontSize = Util.instance.map(mx, 10, 100, 0, 1)
    const h = ~~(mx * 360)
    const col = new Color('hsl(' + h + ', 100%, 50%)')

    // console.log('%c_______________________________________________________________________', 'background-color:#' + col.getHexString())
    console.log('%cSKETCH.181', 'font-size:' + fontSize + 'px;font-weight:bold;color:#' + col.getHexString())

    const max = this._item.length
    this._temp.push({
      mx:mx,
      h:h
    })
    if(this._temp.length > max) {
      this._temp.shift()
    }

    // 画面出力
    const sw = Func.instance.sw()
    const sh = Func.instance.sh()

    const len = this._item.length
    const itemW = sw * 0.8
    const itemH = (sh * 0.8) / len
    this._item.forEach((val,i) => {
      const temp = this._temp[Math.min(i, this._temp.length - 1)]
      const scaleX = Util.instance.map(temp.mx, 0.1, 1, 0, 1)
      val.scale.set(itemW * scaleX, itemH * 0.8, 1)
      val.position.x = itemW * scaleX * 0.5 - itemW * 0.5
      val.position.y = (i * -itemH) - itemH * 0.5 + (itemH * len * 0.5)

      // 色変更
      let h = temp.h

      const col = new Color('hsl(' + h + ', 100%, 50%)')
      const m = val.material as MeshBasicMaterial
      m.color = col
    })

    if (this.isNowRenderFrame()) {
      this._render()
    }
  }


  private _render(): void {
    const bgColor = 0x000000
    this.renderer.setClearColor(bgColor, 1)
    this.renderer.render(this.mainScene, this.camera)
  }


  public isNowRenderFrame(): boolean {
    return this.isRender
  }


  _resize(isRender: boolean = true): void {
    super._resize();

    const w = Func.instance.sw();
    const h = Func.instance.sh();

    if(Conf.instance.IS_SP || Conf.instance.IS_TAB) {
      if(w == this.renderSize.width && this.renderSize.height * 2 > h) {
        return
      }
    }

    this.renderSize.width = w;
    this.renderSize.height = h;

    this.updateCamera(this.camera, w, h);

    let pixelRatio: number = window.devicePixelRatio || 1;

    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(w, h);
    this.renderer.clear();

    if (isRender) {
      this._render();
    }
  }
}
