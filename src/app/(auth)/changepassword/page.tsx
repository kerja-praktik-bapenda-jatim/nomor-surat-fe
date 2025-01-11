import { Box, Title, Text } from "@mantine/core";
import { ChangePasswordForm } from "@/components/Auth/ChangePasswordForm";
import classes from "../layout.module.css";


export default function ChangePassword() {
    return (
        <Box className={classes.wrapper}>
    
            <Title order={1} fw={700} ta="center" mt={25}>
                Ubah Password
            </Title>
        
            <Box w={400}>
                <ChangePasswordForm />
            </Box>
        </Box>
    );
}