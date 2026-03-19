import { useState, useCallback } from 'react';
import CropList from './CropList';

export default function CropTab({ onSetSubPage }) {
  const [inDetail, setInDetail] = useState(false);

  const handleSetSubPage = useCallback((info) => {
    setInDetail(!!info);
    onSetSubPage?.(info);
  }, [onSetSubPage]);

  return <CropList onSetSubPage={handleSetSubPage} />;
}
