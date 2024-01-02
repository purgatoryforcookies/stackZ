import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import { TbReload } from "react-icons/tb";


import { Fragment, useEffect, useState } from 'react';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';


function Settings() {
    const [open, setOpen] = useState(false);


    const buttonStyleDark = {
        color: 'var(--primary)', borderColor: 'var(--primary-accent)',
        "&:hover": {
            border: "1px solid var(--primary-accent)",
        },
        padding: '0.2rem 1rem',
    }

    useEffect(() => {

        const keypresse = (event: KeyboardEvent) => {
            if (event.keyCode === 27) {
                setOpen(!open)
            }

        }

        document.addEventListener("keydown", keypresse);
        return () => {
            document.removeEventListener("keydown", keypresse);
        }

    }, [])

    return (

        <Fragment >
            <Button onClick={() => setOpen(!open)} sx={buttonStyleDark}>Settings</Button>
            <Drawer
                anchor="right"
                open={open}
                onClose={() => setOpen(false)}

            >
                <List sx={{ backgroundColor: 'var(--background)', height: '100%', color: 'var(--primary)', padding: '1rem' }}>

                    <ListItem  >
                        <ListItemButton>
                            <ListItemText primary={'1'} sx={{ padding: '0 1rem 0 0' }} />
                            <ListItemIcon>
                                <TbReload size={20} color='var(--primary)' />
                            </ListItemIcon>
                            <ListItemText primary={'Reload command.json'} />
                        </ListItemButton>
                    </ListItem>
                    <ListItem  >
                        <ListItemButton onClick={() => window.api.save()}>
                            <ListItemText primary={'2'} sx={{ padding: '0 1rem 0 0' }} />
                            <ListItemIcon>
                                <TbReload size={20} color='var(--primary)' />
                            </ListItemIcon>
                            <ListItemText primary={'Save'} />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Drawer>
        </Fragment>

    );
}

export default Settings