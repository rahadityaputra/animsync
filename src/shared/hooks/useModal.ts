import { useCallback, useEffect, useState } from "react";

const useModal = (trigger: boolean) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    setIsOpen(trigger)
  }, [trigger])

  const open = useCallback(() => {
    setIsOpen(true);
  }, [])

  const close = useCallback(() => {
    setIsOpen(false);
  }, [])

  return { isOpen, open, close }

}

export default useModal;
