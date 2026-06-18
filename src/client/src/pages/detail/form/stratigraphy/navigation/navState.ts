type Heights = Readonly<Record<string, number>>;

interface NavStateInit {
  lensStart?: number;
  rawLensSize?: number;
  height?: number;
  contentHeights?: Heights;
  headerHeights?: Heights;
}

const getMax = (heights: Heights): number => {
  const values = Object.values(heights);
  return values.length === 0 ? 0 : Math.max(...values);
};

export class NavState {
  // At which depth in meter does the visible part begin
  readonly lensStart: number;

  // How many meters are visible. Zero is a special value and means 'use maxContent'.
  readonly rawLensSize: number;

  // height of this component in pixels
  readonly height: number;

  // What is the maximum depth in meters of the content
  // This is a dictionary. Every child should enter its value on a separate key
  readonly contentHeights: Heights;

  // height of the header for each children
  readonly headerHeights: Heights;

  // calculated values
  readonly maxContent: number;
  readonly maxHeader: number;
  readonly pixelPerMeter: number;
  readonly lensSize: number;
  readonly lensEnd: number;

  constructor(init: NavStateInit = {}) {
    this.lensStart = init.lensStart ?? 0;
    this.rawLensSize = init.rawLensSize ?? 0;
    this.height = init.height ?? 0;
    this.contentHeights = Object.freeze({ ...init.contentHeights });
    this.headerHeights = Object.freeze({ ...init.headerHeights });
    this.maxContent = getMax(this.contentHeights);
    this.maxHeader = getMax(this.headerHeights);
    this.lensSize = this.rawLensSize === 0 ? this.maxContent : this.rawLensSize;
    this.pixelPerMeter = (this.height - this.maxHeader) / this.lensSize;
    this.lensEnd = this.lensStart + this.lensSize;
    Object.freeze(this);
  }

  setLensStart(value: number): NavState {
    return new NavState({ ...this, lensStart: value });
  }

  setLensSize(value: number): NavState {
    return new NavState({ ...this, rawLensSize: value });
  }

  setHeight(value: number): NavState {
    return new NavState({ ...this, height: value });
  }

  setContentHeightFromLayers(name: string, layers: ReadonlyArray<{ toDepth: number | null }> | undefined): NavState {
    const height = layers?.reduce((acc, l) => Math.max(acc, l.toDepth ?? 0), 0) ?? 0;
    return this.setContentHeight(name, height);
  }

  setContentHeight(name: string, height: number): NavState {
    const temp = new NavState({
      ...this,
      contentHeights: { ...this.contentHeights, [name]: height },
    });
    if (temp.lensStart + temp.lensSize > temp.maxContent) {
      const newLensStart = Math.max(0, temp.maxContent - temp.lensSize);
      const newLensSize = temp.maxContent - newLensStart;
      return new NavState({ ...temp, lensStart: newLensStart, rawLensSize: newLensSize });
    }
    return temp;
  }

  setHeaderHeight(name: string, height: number): NavState {
    return new NavState({
      ...this,
      headerHeights: { ...this.headerHeights, [name]: height },
    });
  }
}
