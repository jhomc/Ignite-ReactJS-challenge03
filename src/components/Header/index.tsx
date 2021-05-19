import styles from './header.module.scss';

export default function Header() {
  return (
    <header className={styles.headeContainer}>
      <div className={styles.headerContent}>
        <a href="/">
          <img src="/Logo.svg" alt="logo" />
        </a>
      </div>
    </header>
  )
}
