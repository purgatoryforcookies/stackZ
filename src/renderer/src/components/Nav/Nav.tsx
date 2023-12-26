import Settings from '../Common/Settings/Settings'
import styles from './nav.module.css'

function Nav() {
    return (
        <div className={styles.main}>

            <h3>Command Palette</h3>
            <span>
                <Settings />
            </span>

        </div>
    )
}

export default Nav