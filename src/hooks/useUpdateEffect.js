import { useEffect, useRef } from 'react';

const useUpdateEffect = (effect, dependencies) => {
  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) {
      return effect();
    } else {
      isMounted.current = true;
    }
  }, dependencies);
};

export default useUpdateEffect;