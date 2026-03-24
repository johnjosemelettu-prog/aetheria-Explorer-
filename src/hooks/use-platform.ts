import { useState, useEffect } from 'react';

export const usePlatform = () => {
  const [platform, setPlatform] = useState('web');

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    if (isIOS) {
      setPlatform('ios');
    } else if (isAndroid) {
      setPlatform('android');
    }
  }, []);

  return platform;
};