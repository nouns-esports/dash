import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Dash",
	description: "Level up your community",
};

// TODO: When users get redicrected to the site from the bot add a platform query param to show the relevant signin account type

export default function RootLayout(props: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className={`${inter.variable} antialiased`}>{props.children}</body>
		</html>
	);
}
