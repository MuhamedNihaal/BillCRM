import { get } from "./api_helper";
import { toast } from "sonner";

/**
 *
 * @param {string} url  - The Url of the PDF to Fetch
 * @param {boolean} [preview=false] - Show preview and cancel printer func
 * @returns {Promise<void>} Resolve when pdf is loaded
 */

export const getPdf = async (url) => {
  try {
    if (!url || typeof url !== "string") {
      throw new Error("No valid URL provided for PDF fetch");
    }

    let loader = document.getElementById("pdf-loading-overlay");

    if (!loader) {
      loader = document.createElement("div");
      loader.id = "pdf-loading-overlay";
      loader.innerHTML = `
        <div class="pdf-loader-content">
          <div class="pdf-spinner"></div>
          <div class="dot-animation after:absolute text-white dark:text-dark-50 text-sm font-bold">Preparing your file</div>
        </div>
      `;

      loader.style.position = "fixed";
      loader.style.top = "0";
      loader.style.left = "0";
      loader.style.width = "100%";
      loader.style.height = "100%";
      loader.style.display = "flex";
      loader.style.alignItems = "center";
      loader.style.justifyContent = "center";
      loader.style.zIndex = "9999";

      document.body.appendChild(loader);
    }

    // if (pdfAbortController) {
    //   pdfAbortController.abort();
    // }
    // pdfAbortController = new AbortController();

    loader.style.display = "flex";

    const cache = await caches.open("pdf-cache");
    let response = await cache.match(url);

    // response = false;

    if (!response) {
      let res = await get(url, {
        responseType: "blob",
      }).catch(async (err) => {
        if (err.type === "application/json") {
          const text = await err.text();
          const json = JSON.parse(text);
          throw new Error(json?.message || "PDF service returned an error");
        } else throw new Error("Something went wrong while fetching the PDF.");
      });

      response = new Response(res, {
        headers: { "Content-Type": "application/pdf" },
      });

      await cache.put(url, response.clone());
    }
    const blob = await response.blob();

    const blobUrl = URL.createObjectURL(blob);

    let iframe = document.getElementById("pdf-print-frame");

    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "pdf-print-frame";
      iframe.style.display = "none";
      document.body.appendChild(iframe);
    }

    iframe.src = blobUrl;

    iframe.onload = () => {
      loader.style.display = "none";
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    };

    // if (response) {
    //   let res = await get(url, {
    //     responseType: "blob",
    //     signal: pdfAbortController.signal,
    //   });

    //   let cacheUpdate = new Response(res, {
    //     headers: { "Content-Type": "application/pdf" },
    //   });

    //   cache.put(url, cacheUpdate.clone());
    // }
  } catch (error) {
    const loader = document.getElementById("pdf-loading-overlay");
    if (loader) loader.style.display = "none";
    toast.error(
      error?.message || "Something went wrong while fetching the PDF.",
    );
  }
};
