import justifiedLayout from 'justified-layout';
import GLightbox from 'glightbox';

interface JustifiedLayoutResult {
	/**
	 * Height of the container containing the justified layout.
	 */
	containerHeight: number;
	/**
	 * Number of items that are in rows that aren't fully-packed.
	 */
	widowCount: number;
	/**
	 * Computed positional and sizing properties of a box in the justified layout.
	 */
	boxes: LayoutBox[];
}

/**
 * Computed positional and sizing properties of a box in the layout.
 */
interface LayoutBox {
	/**
	 * Aspect ratio of the box.
	 */
	aspectRatio: number;
	/**
	 * Distance between the top side of the box and the top boundary of the justified layout.
	 */
	top: number;
	/**
	 * Width of the box in a justified layout.
	 */
	width: number;
	/**
	 * Height of the box in a justified layout.
	 */
	height: number;
	/**
	 * Distance between the left side of the box and the left boundary of the justified layout.
	 */
	left: number;
	/**
	 * Whether or not the aspect ratio was forced.
	 */
	forcedAspectRatio?: boolean;
}

export async function setupGallery() {
	if (typeof document === 'undefined') return;

	const container = document.getElementById('photo-grid');
	if (!container) {
		console.error('Photo grid container not found.');
		return;
	}

	const imageLinks = Array.from(container.querySelectorAll('.photo-item')) as HTMLElement[];
	const placeholderElements = Array.from(container.querySelectorAll('.photo-placeholder')) as HTMLElement[];

	if (imageLinks.length === 0 && placeholderElements.length === 0) {
		console.warn('No images or placeholders found inside the photo grid.');
		return;
	}

	// Setup load more functionality
	setupLoadMoreButton();

	// Process initially loaded images without waiting for all
	await processInitialImages(container);

	// Initialize GLightbox
	GLightbox({
		selector: '.glightbox',
		openEffect: 'zoom',
		closeEffect: 'fade',
		width: 'auto',
		height: 'auto',
	});
}

async function processInitialImages(container: HTMLElement) {
	const imageLinks = Array.from(container.querySelectorAll('.photo-item')) as HTMLElement[];
	const placeholderElements = Array.from(container.querySelectorAll('.photo-placeholder')) as HTMLElement[];
	
	// Only wait for initially loaded images (not placeholders)
	const loadedImageElements = await waitForLoadedImagesOnly(container);
	
	// Create layout including placeholders
	const totalItems = imageLinks.length + placeholderElements.length;
	const layout = createLayoutFor(loadedImageElements, container, totalItems);
	console.log('Generated layout:', layout);

	// Apply layout to all items
	const allItems = [...imageLinks, ...placeholderElements];
	applyImagesStyleBasedOnLayout(allItems, layout);
	applyContainerStyleBasedOnLayout(container, layout);
}

function setupLoadMoreButton() {
	const loadMoreBtn = document.getElementById('load-more-btn');
	if (!loadMoreBtn) return;

	loadMoreBtn.addEventListener('click', async () => {
		await loadMoreImages();
	});
}

async function loadMoreImages() {
	const container = document.getElementById('photo-grid');
	if (!container) return;

	const loadMoreBtn = document.getElementById('load-more-btn');
	const placeholders = Array.from(container.querySelectorAll('.photo-placeholder[data-loaded="false"]')) as HTMLElement[];
	
	if (placeholders.length === 0) {
		if (loadMoreBtn) loadMoreBtn.style.display = 'none';
		return;
	}

	// Add loading state to button
	if (loadMoreBtn) {
		loadMoreBtn.classList.add('loading');
		loadMoreBtn.textContent = 'Loading...';
		loadMoreBtn.setAttribute('disabled', 'true');
	}

	try {
		// Load next 10 images
		const imagesToLoad = placeholders.slice(0, 10);
		
		for (const placeholder of imagesToLoad) {
			await loadSingleImage(placeholder);
		}

		// Update layout after loading new images
		await processInitialImages(container);

		// Update button text or hide if no more images
		const remainingPlaceholders = Array.from(container.querySelectorAll('.photo-placeholder[data-loaded="false"]')) as HTMLElement[];
		if (remainingPlaceholders.length === 0) {
			if (loadMoreBtn) loadMoreBtn.style.display = 'none';
		} else {
			if (loadMoreBtn) {
				loadMoreBtn.textContent = `Load More Images (${remainingPlaceholders.length} remaining)`;
			}
		}
	} finally {
		// Remove loading state
		if (loadMoreBtn) {
			loadMoreBtn.classList.remove('loading');
			loadMoreBtn.removeAttribute('disabled');
		}
	}
}

async function loadSingleImage(placeholder: HTMLElement) {
	try {
		const imageData = JSON.parse(placeholder.getAttribute('data-image-data') || '{}');
		
		// Create new image element
		const img = new Image();
		img.src = imageData.src;
		img.alt = imageData.title;
		img.className = 'w-full h-full object-cover rounded-sm shadow-sm hover:shadow-lg transition-shadow';
		
		// Wait for image to load
		await new Promise((resolve, reject) => {
			img.onload = resolve;
			img.onerror = reject;
		});

		// Replace placeholder with actual image link
		const link = document.createElement('a');
		link.href = imageData.src;
		link.className = 'photo-item glightbox absolute transition-transform hover:scale-[1.02] hover:z-10';
		link.setAttribute('data-gallery', 'gallery1');
		link.setAttribute('data-type', 'image');
		link.setAttribute('data-loaded', 'true');
		if (imageData.description) {
			link.setAttribute('data-glightbox', `title: ${imageData.description}`);
		}
		
		link.appendChild(img);
		
		// Replace placeholder with actual image
		placeholder.parentNode?.replaceChild(link, placeholder);
		
		// Reinitialize GLightbox for new images
		GLightbox({
			selector: '.glightbox',
			openEffect: 'zoom',
			closeEffect: 'fade',
			width: 'auto',
			height: 'auto',
		});
		
	} catch (error) {
		console.error('Failed to load image:', error);
		// Keep placeholder as is on error
	}
}

function createLayoutFor(
	imageElements: HTMLImageElement[],
	container: HTMLElement,
	totalItemCount?: number,
): JustifiedLayoutResult {
	const imageSizes = imageElements.map((img) => ({
		width: img.naturalWidth || img.width || 300,
		height: img.naturalHeight || img.height || 200,
	}));

	// Add placeholder sizes for items that haven't loaded yet
	const placeholderCount = (totalItemCount || imageElements.length) - imageElements.length;
	for (let i = 0; i < placeholderCount; i++) {
		imageSizes.push({
			width: 300,
			height: 200,
		});
	}

	const layout = justifiedLayout(imageSizes, {
		containerWidth: container.clientWidth || window.innerWidth,
		targetRowHeight: 300,
		boxSpacing: 10,
		containerPadding: 0,
	});
	return layout;
}

async function waitForLoadedImagesOnly(container: HTMLElement) {
	// Only wait for images that are actually loaded (not placeholders)
	const imageElements = Array.from(container.querySelectorAll('.photo-item img')) as HTMLImageElement[];

	await Promise.all(
		imageElements.map(
			(img) =>
				new Promise((resolve) => {
					if (img.complete) {
						resolve(null);
					} else {
						img.onload = () => resolve(null);
						img.onerror = () => resolve(null);
					}
				}),
		),
	);
	return imageElements;
}

function applyImagesStyleBasedOnLayout(imageLinks: HTMLElement[], layout: JustifiedLayoutResult) {
	imageLinks.forEach((el, i) => {
		if (!layout.boxes[i]) return;
		const { left, top, width, height } = layout.boxes[i];

		el.style.position = 'absolute';
		el.style.left = `${left}px`;
		el.style.top = `${top}px`;
		el.style.width = `${width}px`;
		el.style.height = `${height}px`;
		el.style.display = 'block';
	});
}

function applyContainerStyleBasedOnLayout(container: HTMLElement, layout: JustifiedLayoutResult) {
	// Ensure the parent container has relative positioning
	container.style.position = 'relative';
	// Set container height
	container.style.height = `${layout.containerHeight}px`;
}
// Run setupGallery once the page is loaded
if (typeof window !== 'undefined') {
	const debouncedSetup = debounce(setupGallery, 250);

	document.addEventListener('DOMContentLoaded', setupGallery);
	window.addEventListener('resize', debouncedSetup);
}

// Debounce helper
function debounce<T extends (...args: unknown[]) => unknown>(func: T, wait: number) {
	let timeout: ReturnType<typeof setTimeout>;
	return function executedFunction(...args: Parameters<T>) {
		const later = () => {
			clearTimeout(timeout);
			func(...args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
}
