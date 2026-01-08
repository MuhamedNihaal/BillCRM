import clsx from "clsx";
import { useState } from "react";
import { CiImageOn } from "react-icons/ci";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

const Image = ({
  src,
  alt = "",
  classNames = { img: "", wrapper: "", skelton: "", root: "" },
  onError = () => {},
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleError = (e) => {
    if (hasError) {
      return;
    }
    setHasError(true);
    onError(e);
  };

  return (
    <div className={classNames.root}>
      {!isLoaded && (
        <div
          role="status"
          className={clsx(
            "relative flex animate-pulse items-center justify-center overflow-hidden bg-gray-300",
            classNames.skelton,
          )}
        >
          <CiImageOn className="h-10 w-10 text-gray-200" />
          <span className="sr-only">Loading...</span>
        </div>
      )}

      <LazyLoadImage
        wrapperClassName={clsx(classNames?.wrapper)}
        src={src}
        effect="blur"
        onLoad={() => setIsLoaded(true)}
        alt={alt}
        className={clsx(classNames.img)}
        onError={handleError}
      />
    </div>
  );
};

export default Image;
