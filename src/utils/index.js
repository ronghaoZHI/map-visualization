export function loadJs(url, crossing = false) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.onload = resolve;
    script.onerror = reject;
    if (!crossing) {
      script.crossOrigin = "anonymous";
    }

    script.src = url;
    document.body.appendChild(script);
  });
}

export function loadCSS(url) {
  return new Promise((resolve, reject) => {
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.onload = resolve;
    style.onerror = reject;
    style.href = url;
    document.body.appendChild(style);
  });
}