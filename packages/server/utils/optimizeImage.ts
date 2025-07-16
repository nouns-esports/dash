export function optimizeImage(
    image: string,
    options?: {
        width?: number;
        height?: number;
        fit?: "contain" | "cover" | "crop" | "pad" | "scale-down";
        quality?: "low" | "medium" | "high" | "original";
    },
) {
    const url = new URL(image);

    if (options?.width) {
        url.searchParams.set("img-width", options.width.toString());
    }

    if (options?.height) {
        url.searchParams.set("img-height", options.height.toString());
    }

    if (options?.fit) {
        url.searchParams.set("img-fit", options.fit);
    }

    if (options?.quality && options.quality !== "original") {
        url.searchParams.set(
            "img-quality",
            {
                low: "50",
                medium: "75",
                high: "90",
            }[options.quality],
        );
    }

    if (options) {
        url.searchParams.set("img-onerror", "redirect");
    }

    return url.toString();
}
