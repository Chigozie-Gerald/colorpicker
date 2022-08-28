import { useLayoutEffect, useState } from "react";
import AutoWrapper from "../AutoWrapper/AutoWrapper";
import { ReactComponent as CopyIcon } from "../../assets/copy.svg";
import { ReactComponent as CheckIcon } from "../../assets/check.svg";
import { ReactComponent as ColorPickerIcon } from "../../assets/color_picker.svg";
import { ReactComponent as ArrowLeftIcon } from "../../assets/small_arrow_left.svg";
import "./ColorPalette.css";
import {
  abs,
  frame_color,
  getColor,
  getColorDetails,
  getGradient,
  getHeightFromRoot,
  getOpacity,
  getRange,
  hexToRgb,
  luminance,
  modify,
  normalize,
  rgbToHex,
  scheme,
  topValue,
} from "./color";
import { handleCopy } from "../../utilities/copyHandler";

type rect =
  | undefined
  | {
      bottom: number;
      height: number;
      left: number;
      right: number;
      top: number;
      width: number;
      x: number;
      y: number;
    };

const ColorPalette = () => {
  const id = "frame_wrapper_inner_id";
  const getWidth = (): number | null => {
    const frame = document.getElementById(id);
    if (frame) {
      const rect = frame.getBoundingClientRect();
      const width = rect.width;
      return width;
    } else {
      return null;
    }
  };

  const initFrame: [number, number] = [getWidth() || 0, 0];

  useLayoutEffect(() => {
    const frame = document.getElementById(id);
    if (frame) {
      const rect = frame.getBoundingClientRect();
      const height = rect.height;
      const width = rect.width;
      setFrameDimension({ height, width });
      setFrameCord([width, 0]);
    }
  }, [id]);

  const { array: color_array } = getColor(0, 0);
  const [frameDimension, setFrameDimension] = useState<{
    height: number;
    width: number;
  }>();

  const [colorRGB, setColorRGB] = useState<scheme>(color_array);
  const [oldColorRGB, setOldColorRGB] = useState<scheme>(color_array);

  const [rootColor, setRootColor] = useState<scheme>(color_array);
  const [grade, setGrade] = useState(getOpacity(0, 0));
  const [frameCord, setFrameCord] = useState<[number, number]>([...initFrame]);
  const [rgbFormat, setRgbFormat] = useState(true);
  const [gradeCord, setGradeCord] = useState(0);
  const [moveGrade, setMoveGrade] = useState(false);
  const [colorCord, setColorCord] = useState(0);
  const [moveColor, setMoveColor] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeoutId, setTimeoutId] = useState<number | undefined>();

  const rgb = (color: scheme = colorRGB) => {
    return `rgb(${color.join(`, `)})`;
  };
  const rgba = () => `rgb(${colorRGB.join(`, `)}, ${grade})`;

  const setNewColor = (color: scheme) => {
    const old_color = colorRGB;
    setOldColorRGB(old_color);
    setColorRGB(color);
  };

  const frameMovement = (
    X: number,
    Y: number,
    rect: Exclude<rect, undefined>
  ) => {
    setFrameCord([X, Y]);
    const { array, root } = frame_color(
      X,
      Y,
      rect.height,
      rect.width,
      colorRGB,
      rootColor
    );
    setRootColor(root);
    setNewColor(array);
  };

  const trackGrade = (Y: number, rect: Exclude<rect, undefined>) => {
    setGradeCord(Y);
    setGrade(getOpacity(Y, rect.height));
  };

  const trackRoot = (Y: number, rect: Exclude<rect, undefined>) => {
    setColorCord(Y);

    const { array } = getColor(Y, rect.height);
    const { array: rgb } = frame_color(
      frameCord[0],
      frameCord[1],
      frameDimension?.height || rect.height, // height of this container is equal to height of frame
      frameDimension?.width || rect.height, // frame is a square
      array,
      array
    );

    setRootColor(array);
    setNewColor(rgb);
  };

  const trackMovement = (
    rect: Exclude<rect, undefined>,
    trackFunc: (Y: number, rect: Exclude<rect, undefined>) => void,
    element: Element
  ) => {
    const move = (e: MouseEvent) => {
      const y_window = e.clientY;
      const Y = normalize(y_window - rect.y, rect.height);
      trackFunc(Y, rect);
    };

    const move_unbind = () => {
      window.removeEventListener("mousemove", move);
      document.body.style.cursor = "auto";
      setMoveGrade(false);
      setMoveColor(false);
      element.classList.remove(`moving_no_transit`);
    };

    //get the clientY
    //normalize these values after getting the offset from the rect of the element holder
    //call the necessary functions provided
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", move_unbind);
    document.body.style.cursor = "grabbing";
  };

  const windowMovement = (rect: Exclude<rect, undefined>, element: Element) => {
    const move = (e: MouseEvent) => {
      document.body.style.cursor = "default";
      const x_window = e.clientX;
      const y_window = e.clientY;
      const X = normalize(x_window - rect.x, rect.width);
      const Y = normalize(y_window - rect.y, rect.height);
      frameMovement(X, Y, rect);
    };
    const move_unbind = (e: MouseEvent) => {
      window.removeEventListener("mousemove", move);
      document.body.style.cursor = "auto";
      element.classList.remove(`moving_no_transit`);
    };

    //get the clientX and Y values
    //normalize these values after getting the offset from the rect of the element holder
    //call the necessary functions provided
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", move_unbind);
    document.body.style.cursor = "default";
  };

  const getOldRGB = (): string => {
    const oldRange = getRange(oldColorRGB);
    const currentRange = getRange(colorRGB);
    const oldRoot = oldColorRGB.map((num) => modify(num, oldRange)) as scheme;
    const currentRoot = colorRGB.map((num) =>
      modify(num, currentRange)
    ) as scheme;

    let retain = true;
    for (let i = 0; i < oldRoot.length; i++) {
      const num1 = oldRoot[i];
      const num2 = currentRoot[i];
      if (Math.abs(num1 - num2) < 3) {
        continue;
      } else {
        retain = false;
        break;
      }
    }

    if (retain) {
      return rgb(oldColorRGB);
    } else {
      return rgb();
    }
  };

  return (
    <div className="colorPalette regular_text scrollWheelSm">
      <div className="color_result_wrapper colorPalette_rad">
        <div
          style={{
            background: rgba(),
          }}
          className="current_color flex1"
        ></div>
        <div
          style={{
            background: getOldRGB(),
          }}
          className="prev_color"
        ></div>
      </div>
      <div className="color_scheme_wrapper">
        <div className="frame_wrapper flex1">
          <AutoWrapper>
            <div
              id={id}
              className="frame_wrapper_inner"
              style={{ backgroundColor: rgb(rootColor) }}
              onClick={(e) => {
                e.preventDefault();
                const element = e.currentTarget as Element;
                const rect = element.getBoundingClientRect();
                const x = rect.x;
                const y = element.getBoundingClientRect().y;
                const X = e.clientX - x;
                const Y = e.clientY - y;

                //Function
                frameMovement(X, Y, rect);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                const element = e.currentTarget as Element;
                element.classList.add(`moving_no_transit`);
                const rect = element.getBoundingClientRect();

                //Function
                windowMovement(rect, element);
              }}
            >
              <div
                style={{
                  left: frameCord[0] - 4,
                  top: frameCord[1] - 4,
                  borderColor: luminance(colorRGB) ? `#000` : `#fff`,
                }}
                className="pointer circle"
              ></div>
              <div className="bg_frame_white"></div>
              <div className="bg_frame_black"></div>
            </div>
          </AutoWrapper>
        </div>
        <div className="opacity_wrap">
          <div
            onClick={(e) => {
              e.preventDefault();
              const element = e.currentTarget as Element;
              const rect = element.getBoundingClientRect();
              const y = rect.y;
              const Y = e.clientY - y;
              trackGrade(Y, rect);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              const element = e.currentTarget as Element;
              element.classList.add(`moving_no_transit`);
              const rect = element.getBoundingClientRect();
              setMoveGrade(true);
              trackMovement(rect, trackGrade, element);
            }}
            className={`inner ${moveGrade ? `grabbing` : ``}`}
          >
            <div
              style={{
                background: `linear-gradient(to bottom, ${rgb()}, transparent)`,
              }}
              className="color_track"
            ></div>
          </div>
          <div style={{ top: gradeCord }} className="bar_wheel"></div>
        </div>
        <div className="grade">
          <div
            style={{
              background: getGradient(),
            }}
            onClick={(e) => {
              e.preventDefault();
              const element = e.currentTarget as Element;
              const rect = element.getBoundingClientRect();
              const y = rect.y;
              const Y = e.clientY - y;
              trackRoot(Y, rect);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              const element = e.currentTarget as Element;
              element.classList.add(`moving_no_transit`);
              const rect = element.getBoundingClientRect();
              setMoveColor(true);
              trackMovement(rect, trackRoot, element);
            }}
            className={`inner ${moveColor ? `grabbing` : ``}`}
          ></div>
          <div style={{ top: colorCord }} className="bar_wheel"></div>
        </div>
      </div>
      <div className="color_scheme_code">
        <div
          onClick={() => {
            // @ts-ignore
            const hasDropper = window.EyeDropper as boolean;
            if (!hasDropper) {
              return;
            }

            // @ts-ignore
            const eyeDropper = new EyeDropper();

            eyeDropper
              .open()
              .then((result: any) => {
                const rgb = hexToRgb(result.sRGBHex);

                if (rgb && frameDimension) {
                  const { X, Y, color, root } = getColorDetails(rgb);
                  const { height, width } = frameDimension;

                  const y_bar = normalize(
                    abs(
                      (Y / topValue) * height - height
                    ) /*inverse start points */,
                    height
                  );
                  const x_bar = normalize(
                    abs(
                      (X / topValue) * width - width
                    ) /*inverse start points */,
                    width
                  );

                  const cordY = getHeightFromRoot(root, height);
                  setColorCord(cordY);

                  setFrameCord([x_bar, y_bar]);
                  setRootColor(root);
                  setNewColor(color);
                  setGrade(1);
                  setGradeCord(0);
                }
              })
              .catch((e: any) => {
                console.log(e);
              });
          }}
          className="plane center"
        >
          <ColorPickerIcon className="img_div_contain" />
        </div>
        <div className="flex1 flex code_value_wrapper">
          <div
            onClick={() => {
              setRgbFormat(!rgbFormat);
            }}
            className="sideToggle_wrapper center"
          >
            <ArrowLeftIcon className="img_div_contain" />
          </div>
          <div className="flex1 color_code regular_text">
            {rgbFormat ? rgba() : rgbToHex(colorRGB)}
          </div>
          <div
            onClick={() => {
              const color = rgbFormat ? rgba() : rgbToHex(colorRGB);
              handleCopy(color, () => {
                if (timeoutId) {
                  clearTimeout(timeoutId);
                }
                setCopied(true);
                const copyTimeout = window.setTimeout(() => {
                  setCopied(false);
                }, 3000);
                setTimeoutId(copyTimeout);
              });
            }}
            className="copy_wrap center"
          >
            <div className="inner center">
              {copied ? (
                <CheckIcon className="img_div_contain noFill" />
              ) : (
                <CopyIcon className="img_div_contain" />
              )}
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="extra_color_header">Recent Colors</div>
        <div className="color_scheme_extra scrollWheelSm">
          {Array(20)
            .fill(0)
            .map((num, n) => (
              <AutoWrapper key={n} className="prev_color_wrapper">
                <div className="prev_color colorPalette_rad" key={n}></div>
              </AutoWrapper>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ColorPalette;
