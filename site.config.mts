export interface SocialLink {
	name: string;
	url: string;
	handle?: string;
}

export interface NavItem {
	label: string;
	href: string;
}

const siteConfig = {
	// Wordmark shown in nav and footer.
	// Exact typographic form to be finalised — using full name for now.
	wordmark: 'Fraser Embrey',

	// Used in <title> and meta tags
	owner: 'Fraser Embrey',
	siteName: 'Fraser Embrey Photography',
	description:
		'Events and sports photographer based in the UK. Covering corporate events, awards ceremonies, marathons, and more.',

	favicon: 'favicon.svg',
	profileImage: 'profile.jpeg',
	contactEmail: '', // add when ready

	navItems: [
		{ label: 'Work', href: '/work' },
		{ label: 'Services', href: '/services' },
		{ label: 'About', href: '/about' },
		{ label: 'Blog', href: '/blog' },
		{ label: 'Contact', href: '/contact' },
	] satisfies NavItem[],

	socialLinks: [
		{
			name: 'Instagram',
			url: 'https://www.instagram.com/frasersframes',
			handle: '@frasersframes',
		},
	] satisfies SocialLink[],
};

export default siteConfig;
