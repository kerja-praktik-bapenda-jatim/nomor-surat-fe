"use client"

import {Box, Title, Text, Image} from "@mantine/core";
import classes from "./layout.module.css";
import {useAuthRedirect} from "@/services/auth";

interface Props {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: Props) {
	useAuthRedirect()

  return (
    <Box className={classes.wrapper}>
      <Image
        h={170}
        w="auto"
        fit="contain"
        src="/bg.png"
      />
      <Title order={1} fw={700} ta="center" mt={25}>
        SINORAT
          <Text fw={100} size="sm">
            Sistem Informasi Surat Bapenda Jatim
          </Text>
      </Title>
      {/*<Text c="dimmed" size="sm" mt={5}>*/}
      {/*  Don&apos;t have an account?{" "}*/}
      {/*  <Anchor size="sm" href="/register">*/}
      {/*    Sign Up*/}
      {/*  </Anchor>*/}
      {/*</Text>*/}
      <Box w={400}>{children}</Box>
    </Box>
  );
}
