import styles from './modal-overlay.module.css';

export const ModalOverlayUI = ({
  onClick,
  dataTestId // Добавляем пропс
}: {
  onClick: () => void;
  dataTestId?: string; // Добавляем тип
}) => (
  <div
    className={styles.overlay}
    onClick={onClick}
    data-testid={dataTestId || 'modal-overlay'} // Добавляем data-testid
  />
);
