import { Loader, ColorSwatch } from "@mantine/core";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import Draggable from "react-draggable";
import { SWATCHES } from "@/constants";
// import {LazyBrush} from 'lazy-brush';

interface GeneratedResult {
  expression: string;
  answer: string;
}

interface Response {
  expr: string;
  result: string;
  assign: boolean;
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("rgb(255, 255, 255)");
  const [reset, setReset] = useState(false);
  const [dictOfVars, setDictOfVars] = useState({});
  const [result, setResult] = useState<GeneratedResult>();
  const [latexPosition, setLatexPosition] = useState({ x: 10, y: 200 });
  const [latexExpression, setLatexExpression] = useState<
    { expr: string; result: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState<string>("#000000");
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showBgPalette, setShowBgPalette] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [showEraserSizes, setShowEraserSizes] = useState(false);
  const [eraserSize, setEraserSize] = useState<'small' | 'medium' | 'large'>('medium');
  const ERASER_SIZES = {
    small: 8,
    medium: 20,
    large: 36,
  };
  const lastPenColor = useRef<string>(color);
  const [penSize, setPenSize] = useState<'small' | 'medium' | 'large'>('medium');
  const PEN_SIZES = {
    small: 2,
    medium: 4,
    large: 8,
  };

  const COLOR_OPTIONS = [
    "#ffffff", // white
    "#000000", // black
    "#ee3333", // red
    "#e64980", // pink
    "#be4bdb", // purple
    "#893200", // brown
    "#228be6", // blue
    "#3333ee", // dark blue
    "#40c057", // green
    "#00aa00", // dark green
    "#fab005", // yellow
    "#fd7e14", // orange
    "#18181b", // classic dark
    "#f3f4f6", // classic light
  ];

  // Move history and currentHistoryIndex to the very top
  const [history, setHistory] = useState<{
    latexExpressions: { expr: string; result: string }[][];
    canvasStates: string[];
  }>({
    latexExpressions: [],
    canvasStates: [],
  });
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);

  const renderLatexToCanvas = useCallback((expression: string, answer: string) => {
    const latex = {
      expr: expression,
      result: answer,
    };
    setLatexExpression((prev) => [...prev, latex]);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [backgroundColor]);

  const resetCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [backgroundColor]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight - 80;
        ctx.lineCap = "round";
        ctx.lineWidth = 3;
      }
    }
  }, []);

  useEffect(() => {
    if (latexExpression.length > 0 && window.MathJax) {
      setTimeout(() => {
        window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
      }, 0);
    }
  }, [latexExpression]);

  useEffect(() => {
    if (result) {
      renderLatexToCanvas(result.expression, result.answer);
    }
  }, [result, renderLatexToCanvas]);

  useEffect(() => {
    if (reset) {
      resetCanvas();
      setLatexExpression([]);
      setResult(undefined);
      setDictOfVars({});
      setReset(false);
    }
  }, [reset, resetCanvas]);

  useEffect(() => {
    // const canvas = canvasRef.current;

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);

    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML";
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.MathJax.Hub.Config({
        tex2jax: {
          inlineMath: [
            ["$", "$"],
            ["\\(", "\\)"],
          ],
        },
      });
    };

    return () => {
      document.head.removeChild(script);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [resizeCanvas]);

  useEffect(() => {
    if (color.toLowerCase() === backgroundColor.toLowerCase()) {
      setColor(backgroundColor === "#ffffff" ? "#000000" : "#ffffff");
    }
  }, [backgroundColor]);

  useEffect(() => {
    if (isErasing) {
      lastPenColor.current = color;
      setColor(backgroundColor);
    } else {
      setColor(lastPenColor.current);
    }
  }, [isErasing, backgroundColor]);

  // Initialize history with empty canvas state
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Save initial empty state
      setHistory({
        latexExpressions: [[]],
        canvasStates: [canvas.toDataURL()],
      });
      setCurrentHistoryIndex(0);
    }
  }, []); // Run once on mount

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      setHistory(prev => {
        const newLatexExpressions = prev.latexExpressions.slice(0, currentHistoryIndex + 1);
        const newCanvasStates = prev.canvasStates.slice(0, currentHistoryIndex + 1);
        return {
          latexExpressions: [...newLatexExpressions, [...latexExpression]],
          canvasStates: [...newCanvasStates, canvas.toDataURL()],
        };
      });
      setCurrentHistoryIndex(prev => prev + 1);
    }
  }, [latexExpression, currentHistoryIndex]);

  // Improved getCanvasCoords to use pageX/pageY for more robust positioning
  function getCanvasCoords(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    let x, y;
    if ('touches' in e) {
      x = e.touches[0].pageX - rect.left - window.scrollX;
      y = e.touches[0].pageY - rect.top - window.scrollY;
    } else {
      x = (e as React.MouseEvent).pageX - rect.left - window.scrollX;
      y = (e as React.MouseEvent).pageY - rect.top - window.scrollY;
    }
    return { x, y };
  }

  // Update startDrawing and draw to use getCanvasCoords
  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (canvas) {
      saveToHistory();
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        const { x, y } = getCanvasCoords(e, canvas);
        ctx.moveTo(x, y);
        setIsDrawing(true);
      }
    }
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) {
      return;
    }
    if ("touches" in e) {
      e.preventDefault();
    }
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = color;
        ctx.lineWidth = isErasing ? ERASER_SIZES[eraserSize] : PEN_SIZES[penSize];
        const { x, y } = getCanvasCoords(e, canvas);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  };

  // Update stopDrawing to only save if actually drew something
  const stopDrawing = useCallback(() => {
    if (isDrawing) {
      saveToHistory();
    }
    setIsDrawing(false);
  }, [isDrawing, saveToHistory]);

  const runRoute = async () => {
    setLoading(true);
    const canvas = canvasRef.current;

    if (canvas) {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/calculate`,
          {
            image: canvas.toDataURL("image/png"),
            dict_of_vars: dictOfVars,
          },

          {
            withCredentials: true,
          }
        );

        const resp = await response.data;

        if (resp.data.length === 0) {
          alert("Improve drawing and retry.");
          return;
        }

        resp.data.forEach((data: Response) => {
          if (data.assign === true) {
            setDictOfVars({
              ...dictOfVars,
              [data.expr]: data.result,
            });
          }
        });
        const ctx = canvas.getContext("2d");
        const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
        let minX = canvas.width,
          minY = canvas.height,
          maxX = 0,
          maxY = 0;

        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const i = (y * canvas.width + x) * 4;
            if (imageData.data[i + 3] > 0) {
              minX = Math.min(minX, x);
              minY = Math.min(minY, y);
              maxX = Math.max(maxX, x);
              maxY = Math.max(maxY, y);
            }
          }
        }

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        setLatexPosition({ x: centerX, y: centerY });
        resp.data.forEach((data: Response) => {
          setTimeout(() => {
            setResult({
              expression: data.expr,
              answer: data.result,
            });
          }, 1000);
        });
      } catch (error) {
        console.error("Error during calculation:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Update deleteResult to use saveToHistory() before deleting, for consistent undo/redo
  const deleteResult = useCallback((indexToDelete: number) => {
    saveToHistory();
    setLatexExpression((prev) => prev.filter((_, index) => index !== indexToDelete));
  }, [saveToHistory]);

  // Function to revert to previous state
  const revertToPreviousState = useCallback(() => {
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      setCurrentHistoryIndex(newIndex);
      setLatexExpression(history.latexExpressions[newIndex]);
      // Restore canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
          };
          img.src = history.canvasStates[newIndex];
        }
      }
    }
  }, [currentHistoryIndex, history]);

  // Update redo functionality
  const redoToNextState = useCallback(() => {
    if (currentHistoryIndex < history.latexExpressions.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      setCurrentHistoryIndex(newIndex);
      setLatexExpression(history.latexExpressions[newIndex]);
      // Restore canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
          };
          img.src = history.canvasStates[newIndex];
        }
      }
    }
  }, [currentHistoryIndex, history]);

  // Update reset function to save state before resetting
  const handleReset = useCallback(() => {
    saveToHistory();
    setReset(true);
  }, [saveToHistory]);

  return (
    <>
      <div className="fixed top-0 left-0 w-full bg-gray-900 bg-opacity-70 backdrop-filter backdrop-blur-lg z-30 py-3">
        <div className="container mx-auto px-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleReset}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              variant="default"
              size="sm"
            >
              ♻️ Reset
            </Button>
            <div className="flex items-center gap-1">
              <Button
                onClick={revertToPreviousState}
                className={`px-3 py-1 rounded ${
                  currentHistoryIndex > 0 
                    ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
                variant="default"
                size="sm"
                disabled={currentHistoryIndex <= 0}
                title="Undo last action"
              >
                ↩️ Undo
              </Button>
              <Button
                onClick={redoToNextState}
                className={`px-3 py-1 rounded ${
                  currentHistoryIndex < history.latexExpressions.length - 1
                    ? 'bg-purple-500 hover:bg-purple-600 text-white'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
                variant="default"
                size="sm"
                disabled={currentHistoryIndex >= history.latexExpressions.length - 1}
                title="Redo last undone action"
              >
                ↪️ Redo
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                onClick={() => setShowBgPalette(!showBgPalette)}
                className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
                variant="outline"
                size="sm"
              >
                🖌️ BG Colour {showBgPalette ? "▲" : "▼"}
              </Button>
              {showBgPalette && (
                <div className="absolute top-full left-0 mt-1 flex flex-wrap items-center justify-center gap-1 p-1 bg-gray-800 rounded-md max-w-[200px] z-50">
                  {COLOR_OPTIONS.map((swatch: string) => (
                    <ColorSwatch
                      key={swatch}
                      color={swatch}
                      onClick={() => {
                        setBackgroundColor(swatch);
                        setShowBgPalette(false);
                      }}
                      style={{
                        backgroundColor: swatch,
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        border: backgroundColor === swatch ? "2px solid white" : "1px solid gray",
                        cursor: "pointer",
                      }}
                      className="focus:outline-none hover:scale-110 transition-transform"
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <Button
                onClick={() => {
                  setShowEraserSizes(!showEraserSizes);
                  if (!isErasing) {
                    setIsErasing(true);
                  }
                }}
                className={`px-3 py-1 rounded ${isErasing ? 'bg-yellow-400 text-black' : 'bg-gray-700 text-white'} hover:bg-yellow-300`}
                variant="outline"
                size="sm"
              >
                🧹 Erase {showEraserSizes ? "▲" : "▼"}
              </Button>
              {showEraserSizes && (
                <div className="absolute top-full left-0 mt-1 flex flex-col items-stretch gap-1 p-1 bg-gray-800 rounded-md min-w-[100px] z-50">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        setEraserSize(size);
                      }}
                      className={`px-2 py-1 rounded text-left ${
                        eraserSize === size ? 'bg-yellow-400 text-black' : 'bg-gray-200 text-gray-700'
                      } text-xs font-semibold hover:bg-yellow-300 transition-colors`}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <Button
                onClick={() => setShowColorPalette(!showColorPalette)}
                className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
                variant="outline"
                size="sm"
              >
                🎨 Colors {showColorPalette ? "▲" : "▼"}
              </Button>
              {showColorPalette && (
                <div className="absolute top-full left-0 mt-1 flex flex-wrap items-center justify-center gap-1 p-1 bg-gray-800 rounded-md max-w-[200px] z-50">
                  {COLOR_OPTIONS.map((swatch: string) => {
                    const isDisabled = swatch === backgroundColor;
                    return (
                      <ColorSwatch
                        key={swatch}
                        color={swatch}
                        onClick={() => {
                          if (!isDisabled) {
                            setColor(swatch);
                            setIsErasing(false);
                            setShowEraserSizes(false);
                          }
                        }}
                        style={{
                          backgroundColor: swatch,
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          border: color === swatch ? "2px solid white" : "1px solid gray",
                          cursor: isDisabled ? "not-allowed" : "pointer",
                          opacity: isDisabled ? 0.3 : 1,
                        }}
                        className="focus:outline-none hover:scale-110 transition-transform"
                      />
                    );
                  })}
                </div>
              )}
            </div>
            <div className="relative flex items-center gap-1">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setPenSize(size);
                    setIsErasing(false);
                    setShowEraserSizes(false);
                  }}
                  className={`px-2 py-1 rounded ${penSize === size ? 'bg-blue-400 text-white' : 'bg-gray-200 text-gray-700'} text-xs font-semibold border border-gray-300`}
                  title={`Pen size: ${size}`}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <Button
            onClick={runRoute}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            variant="default"
            disabled={loading}
            size="sm"
          >
            {loading ? <Loader size="xs" color="white" /> : "Go"}
          </Button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        id="canvas"
        className="absolute top-0 left-0 w-full h-full touch-none"
        style={{ background: backgroundColor }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />

      {latexExpression &&
        latexExpression.map((latex, index) => (
          <Draggable
            key={index}
            defaultPosition={latexPosition}
            onStop={(_, data) => setLatexPosition({ x: data.x, y: data.y })}
          >
            <div className="absolute p-3 rounded-lg shadow-md bg-gray-800 text-white hover:bg-gray-700 transition duration-200 cursor-move z-40 border border-gray-700 group">
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent dragging when clicking delete
                    deleteResult(index);
                  }}
                  className="p-1 bg-red-500 hover:bg-red-600 rounded-full text-white text-xs"
                  title="Delete result"
                >
                  ✕
                </button>
              </div>
              {latex.expr !== undefined && latex.expr !== null && (
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm text-gray-300">Expression:</span>
                  <div className="text-base font-serif">{latex.expr}</div>
                </div>
              )}
              {latex.result !== undefined && latex.result !== null && (
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm text-gray-300">Result:</span>
                  <div className="text-base font-serif">{latex.result}</div>
                </div>
              )}
            </div>
          </Draggable>
        ))}

      <div className="fixed bottom-2 right-2 text-black text-xs bg-white bg-opacity-70 px-2 py-1 rounded z-40 shadow-md dark:bg-gray-900 dark:text-white">
        @ Abhi
      </div>
    </>
  );
}
