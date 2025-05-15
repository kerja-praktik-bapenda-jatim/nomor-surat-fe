module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
  },
	env: {
		API_BASE_URL:"http://localhost:8080/api/"
	}
};
