import type { AstroInstance } from 'astro';
import { Github, Instagram } from 'lucide-astro';

export interface SocialLink {
	name: string;
	url: string;
	icon: AstroInstance;
}

export default {
	title: 'FE',
	favicon: 'favicon.svg',
	owner: 'Fraser Embrey',
	profileImage: 'profile.jpeg',
	socialLinks: [
		{
			name: 'GitHub',
			url: 'https://github.com/fraserembrey',
			icon: Github,
		} as SocialLink,
		{
			name: 'Instagram',
			url: 'https://www.instagram.com/frasersframes',
			icon: Instagram,
		} as SocialLink,
	],
};
