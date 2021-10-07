interface BackgroundNFT {
	artist: string;
	image: string;
	name: string;
	link: string;
}

const backgroundsNFT: BackgroundNFT[] = [
	{
		artist: '@rikoostenbroek',
		image: 'Silent_wave_Rik_Oostenbroek.webp',
		name: 'Silent Wave',
		link: 'https://superrare.com/rikoostenbroek'
	},
	{
		artist: '@rikoostenbroek',
		image: 'The_Soft_Parade_Rik_Oostenbroek.webp',
		name: 'The Soft Parade',
		link: 'https://superrare.com/rikoostenbroek'
	},
	{
		artist: '@rikoostenbroek',
		image: 'MIRAGE_RIK_OOSTENBROEK.webp',
		name: 'Mirage',
		link: 'https://superrare.com/rikoostenbroek'
	},
	{
		artist: '@petertarka',
		image: 'SPACE_JETSKI.webp',
		name: 'Jetski',
		link: 'https://superrare.com/petertarka'
	},
	{
		artist: '@petertarka',
		image: 'ACID_TRIP_NFT.webp',
		name: 'Acid Trip',
		link: 'https://superrare.com/petertarka'
	},
	{
		artist: '@petertarka',
		image: 'VIVID_DREAMS_NFT_PT.webp',
		name: 'Vivid Dreams',
		link: 'https://superrare.com/petertarka'
	},
	{
		artist: '@petertarka',
		image: 'AARCHES_NFT1.webp',
		name: 'Arches-Depth',
		link: 'https://superrare.com/petertarka'
	},
	{
		artist: '@maalavidaa',
		image: 'king-of-chrome.webp',
		name: 'King Of Chrome',
		link: 'https://superrare.com/maalavidaa'
	},
	{
		artist: '@maalavidaa',
		image: 'to-exist-is-to-survive-unfair-choices.webp',
		name: 'To Exist Is To Survive Unfair Choices',
		link: 'https://superrare.com/maalavidaa'
	}
];

const getRandomNFTBackground = (): BackgroundNFT => {
	const randomIndex = Math.floor(Math.random() * backgroundsNFT.length);

	return backgroundsNFT[randomIndex];
};

export { getRandomNFTBackground, BackgroundNFT };
