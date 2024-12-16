<script>
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';

	// @ts-ignore
	// @ts-ignore
	let injuries = [
		{ id: 1677, name: 'Marv - Shot in the face', dragging: false },
		{ id: 1496, name: "Harry - Shot in the Gentleman's agreement", dragging: false },
		{ id: 6001, name: 'Marv - Falling down the steps', dragging: false },
		{ id: 9321, name: 'Marv - Falling at basement door', dragging: false },
		{ id: 3006, name: 'Marv - Crowbar to the noggin', dragging: false },
		{ id: 2239, name: 'Marv - Iron down the laundry chute', dragging: false },
		{ id: 7758, name: 'Marv - Nail through the foot', dragging: false },
		{ id: 2499, name: 'Marv - Standing on glass baubles', dragging: false },
		{ id: 4321, name: 'Harry - Falling up the icy steps', dragging: false },
		{ id: 4441, name: 'Harry - Burning hand on door handle', dragging: false },
		{ id: 6395, name: 'Harry - Falling down the steps', dragging: false },
		{ id: 7749, name: 'Harry - Blow torched', dragging: false },
		{ id: 5498, name: 'Harry - Lubed and feathered', dragging: false },
		{ id: 9914, name: 'Marv & Harry - Micro machines', dragging: false },
		{ id: 2820, name: 'Marv & Harry - Paint can to the face', dragging: false },
		{ id: 2258, name: 'Marv - Tarantula', dragging: false },
		{ id: 5253, name: 'Harry - Crowbar to the ribs', dragging: false },
		{ id: 9496, name: 'Marv & Harry - Falling from the tree house', dragging: false }
	];

	/**
	 * @type {any[]}
	 */
	let averageRankings = [];
	/**
	 * @type {number | null}
	 */
	let draggedIndex = null;

	// Drag-and-drop handling
	/**
	 * @param {DragEvent & { currentTarget: EventTarget & HTMLLIElement; }} event
	 * @param {number} index
	 */
	// @ts-ignore
	function handleDragStart(event, index) {
		draggedIndex = index;
	}

	/**
	 * @param {DragEvent & { currentTarget: EventTarget & HTMLLIElement; }} event
	 * @param {number} index
	 */
	// @ts-ignore
	function handleDrop(event, index) {
		if (draggedIndex !== null) {
			// Create a copy of the array to ensure reactivity
			const updatedInjuries = [...injuries];

			// Perform the splice operations on the copy
			const [movedItem] = updatedInjuries.splice(draggedIndex, 1);
			updatedInjuries.splice(index, 0, movedItem);

			// Reassign the array to trigger reactivity
			injuries[index].dragging = false;
			injuries = updatedInjuries;

			// Reset draggedIndex
			draggedIndex = null;
		}
	}

	/**
	 * @param {DragEvent & { currentTarget: EventTarget & HTMLLIElement; }} event
	 * @param {number} index
	 */
	function handleDragOver(event, index) {
		event.preventDefault();
		injuries[index].dragging = true;
	}
	/**
	 * @param {number} index
	 */
	function handleDragLeave(index) {
		injuries[index].dragging = false;
	}

	// Submit rankings to Supabase
	async function submitRanking() {
		const ranking = injuries.map((item) => item.id);
		// @ts-ignore
		const { data, error } = await supabase.from('rankings').insert([{ ranking }]);
		if (error) {
			console.error('Error submitting ranking:', error.message);
			alert('Failed to submit ranking.');
		} else {
			alert('Ranking submitted successfully!');
			fetchWorldAverage();
		}
	}

	let fetchedAverage = false;
	// Fetch global average rankings from Supabase
	async function fetchWorldAverage() {
		const { data, error } = await supabase.from('rankings').select('ranking');
		if (error) {
			console.error('Error fetching world average:', error.message);
		} else {
			/** @type {{ [key: string]: { total: number; count: number } }} */
			const aggregate = {};
			data.forEach((entry) => {
				entry.ranking.forEach((/** @type {string | number} */ id, /** @type {number} */ index) => {
					if (!aggregate[id]) {
						aggregate[id] = { total: 0, count: 0 };
					}
					aggregate[id].total += index + 1;
					aggregate[id].count += 1;
				});
			});
			averageRankings = Object.entries(aggregate)
				.map(([id, { total, count }]) => ({
					id,
					name: injuries.find((injury) => injury.id === Number(id))?.name || `Injury ${id}`,
					avgRank: (total / count).toFixed(2)
				}))
				.sort((a, b) => Number(a.avgRank) - Number(b.avgRank));
			fetchedAverage = true;
		}
	}

	// Snow effect logic
	// @ts-ignore
	onMount(() => {
		const COUNT = 300;
		const masthead = document.querySelector('main');
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		let width = masthead?.clientWidth;
		let height = masthead?.clientHeight;
		let active = false;

		function onResize() {
			width = masthead?.clientWidth;
			height = masthead?.clientHeight;
			// @ts-ignore
			canvas.width = width;
			// @ts-ignore
			canvas.height = height;
			// @ts-ignore
			ctx.fillStyle = '#FFF';
			// @ts-ignore
			active = width > 600;
			if (active) requestAnimationFrame(update);
		}

		class Snowflake {
			constructor() {
				this.reset();
			}
			reset() {
				// @ts-ignore
				this.x = Math.random() * width;
				// @ts-ignore
				this.y = Math.random() * -height;
				this.vy = 1 + Math.random() * 3;
				this.vx = 0.5 - Math.random();
				this.r = 1 + Math.random() * 2;
				this.o = 0.5 + Math.random() * 0.5;
			}
		}

		canvas.style.position = 'absolute';
		canvas.style.left = '0';
		canvas.style.top = '0';
		canvas.style.pointerEvents = 'none';
		// @ts-ignore
		masthead.style.position = 'relative';
		// @ts-ignore
		masthead.appendChild(canvas);

		const snowflakes = Array.from({ length: COUNT }, () => new Snowflake());

		function update() {
			// @ts-ignore
			ctx.clearRect(0, 0, width, height);
			if (!active) return;

			for (const snowflake of snowflakes) {
				// @ts-ignore
				snowflake.y += snowflake.vy;
				// @ts-ignore
				snowflake.x += snowflake.vx;

				// @ts-ignore
				ctx.globalAlpha = snowflake.o;
				// @ts-ignore
				ctx.beginPath();
				// @ts-ignore
				ctx.arc(snowflake.x, snowflake.y, snowflake.r, 0, Math.PI * 2);
				// @ts-ignore
				ctx.closePath();
				// @ts-ignore
				ctx.fill();

				// @ts-ignore
				if (snowflake.y > height) snowflake.reset();
			}

			// @ts-ignore
			requestAnimFrame(update);
		}

		// @ts-ignore
		window.requestAnimFrame =
			window.requestAnimationFrame ||
			// @ts-ignore
			window.webkitRequestAnimationFrame ||
			// @ts-ignore
			window.mozRequestAnimationFrame ||
			// @ts-ignore
			((callback) => window.setTimeout(callback, 1000 / 60));

		onResize();
		window.addEventListener('resize', onResize);

		return () => {
			window.removeEventListener('resize', onResize);
			masthead?.removeChild(canvas);
		};
	});
</script>

<main>
	<aside>
		<h1>The Brutality of Kevin McCallister</h1>
		<p>
			This site invites you to critically evaluate his methods and rank the severity of his
			ingenious, yet undeniably brutal, assaults on Harry and Marv. Were these traps truly acts of
			self-defense, or the calculated excesses of a child reveling in unchecked power?
		</p>
		<p>The debate starts here.</p>
		<p>
			<strong>
				Drag the attacks in to order of aggression, brutality and overwhelming force, then submit to
				see what the world thinks.
			</strong>
		</p>
	</aside>
	<section class="yours">
		<ul>
			{#each injuries as injury, index}
				<li
					draggable="true"
					on:dragstart={(event) => handleDragStart(event, index)}
					on:drop={(event) => handleDrop(event, index)}
					on:dragover={(event) => handleDragOver(event, index)}
					on:dragleave={() => handleDragLeave(index)}
					class:dragging={injury.dragging}
				>
					{injury.name}
				</li>
			{/each}
		</ul>
		<button on:click={submitRanking}>Submit your ranking</button>
	</section>

	<section class="world">
		{#if !fetchedAverage}
			<button on:click={fetchWorldAverage}> Discover the worlds thoughts </button>
		{:else}
			<h2>How the world sees Kevin</h2>
			<ol>
				{#each averageRankings as ranking}
					<li>{ranking.name}</li>
				{/each}
			</ol>
		{/if}
	</section>
</main>

<footer>
	<ul>
		<li>Snow from https://codepen.io/radum/pen/xICAB</li>
		<li>Colours from https://codepen.io/adamlindqvist/pen/EaPeJg</li>
	</ul>
</footer>

<style>
	:root {
		--alpha: 1;
		--red: hsla(1.7, 74.4%, 45.9%, var(--alpha));
		--green: hsla(142.6, 52.3%, 42.7%, var(--alpha));
		--dark-green: hsla(159, 80.4%, 30%, var(--alpha));
		--text-background: hsla(60, 55.6%, 91.2%, var(--alpha));
		font-family: system-ui;
		line-height: 1.4;
		background: repeating-linear-gradient(
			to top left,
			var(--red),
			var(--red) 3rem,
			var(--green) 0,
			var(--green) 6rem,
			var(--dark-green) 0,
			var(--dark-green) 9rem
		);
		min-block-size: 100vh;
	}
	main {
		display: grid;
		gap: 1rem;
		grid-template-columns: 1fr;
		align-items: start;
		@media (min-width: 800px) {
			grid-template-columns: 1fr 2fr 1fr;
			gap: 2rem;
		}
	}
	aside {
		h1 {
			font-size: 3rem;
			line-height: 0.9;
			text-wrap: balance;
		}
		background-color: var(--text-background);
		padding: 1rem 2rem;
		border-radius: 0.125rem;
		box-shadow: 0 0 0.5rem var(--dark-green);
	}
	ul {
		list-style: none;
		padding: 0;
	}
	.yours {
		background: var(--text-background);
		padding: 1rem 2rem;
		border-radius: 0.125rem;
		box-shadow: 0 0 0.5rem var(--dark-green);
		display: flex;
		flex-direction: column;
		li {
			padding: 0.5rem 1rem;
			margin-bottom: 0.5rem;
			font-weight: bold;
			cursor: grab;
			border-radius: 1rem;
			border-width: 0.125rem;
			border-style: dashed;

			&:nth-child(3n) {
				border-color: var(--red);
			}
			&:nth-child(3n + 1) {
				border-color: var(--dark-green);
			}
			&:nth-child(3n + 2) {
				border-color: var(--green);
			}
			&.dragging {
				opacity: 0.5;
				background-color: var(--red);
			}
		}
		button {
			margin-inline-start: auto;
			background-color: var(--dark-green);
			color: var(--text-background);
			font-weight: bold;
			padding: 1rem 2rem;
			border: none;
			border-radius: 0.25rem;
			cursor: pointer;
			font-size: 1.25rem;
		}
	}
	.world {
		background: var(--text-background);
		padding: 1rem 2rem;
		border-radius: 0.125rem;
		box-shadow: 0 0 0.5rem var(--dark-green);
		button {
			margin-inline-start: auto;
			background-color: var(--green);
			color: var(--text-background);

			padding: 1rem 2rem;
			border: none;
			border-radius: 0.25rem;
			cursor: pointer;
			font-size: 1rem;
		}
	}
</style>
