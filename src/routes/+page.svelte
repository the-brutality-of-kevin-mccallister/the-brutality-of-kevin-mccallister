<script>
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';

	/**
	 * @type {{ id: number; name: string; dragging: boolean; image: string, victim:string }[]}
	 */
	let injuries = [
		{
			id: 1677,
			name: 'Shot in the face',
			dragging: false,
			image: '/images/marv.jpg',
			victim: 'marv'
		},
		{
			id: 1496,
			name: "Shot in the Gentleman's agreement",
			dragging: false,
			image: '/images/harry.jpg',
			victim: 'harry'
		},
		{
			id: 6001,
			name: 'Falling down the steps',
			dragging: false,
			image: '/images/marv.jpg',
			victim: 'marv'
		},
		{
			id: 9321,
			name: 'Falling at basement door',
			dragging: false,
			image: '/images/marv.jpg',
			victim: 'marv'
		},
		{
			id: 3006,
			name: 'Crowbar to the noggin',
			dragging: false,
			image: '/images/marv.jpg',
			victim: 'marv'
		},
		{
			id: 2239,
			name: 'Iron down the laundry chute',
			dragging: false,
			image: '/images/marv.jpg',
			victim: 'marv'
		},
		{
			id: 7758,
			name: 'Nail through the foot',
			dragging: false,
			image: '/images/marv.jpg',
			victim: 'marv'
		},
		{
			id: 2499,
			name: 'Standing on glass baubles',
			dragging: false,
			image: '/images/marv.jpg',
			victim: 'marv'
		},
		{
			id: 4321,
			name: 'Falling up the icy steps',
			dragging: false,
			image: '/images/harry.jpg',
			victim: 'harry'
		},
		{
			id: 4441,
			name: 'Burning hand on door handle',
			dragging: false,
			image: '/images/harry.jpg',
			victim: 'harry'
		},
		{
			id: 6395,
			name: 'Falling down the steps',
			dragging: false,
			image: '/images/harry.jpg',
			victim: 'harry'
		},
		{
			id: 7749,
			name: 'Blow torched',
			dragging: false,
			image: '/images/harry.jpg',
			victim: 'harry'
		},
		{
			id: 5498,
			name: 'Lubed and feathered',
			dragging: false,
			image: '/images/harry.jpg',
			victim: 'harry'
		},
		{
			id: 9914,
			name: 'MicroMachines',
			dragging: false,
			image: '/images/marv-harry.jpg',
			victim: 'marv-harry'
		},
		{
			id: 2820,
			name: 'Paint can to the face',
			dragging: false,
			image: '/images/marv-harry.jpg',
			victim: 'marv-harry'
		},
		{
			id: 2258,
			name: 'Tarantula in the mouth',
			dragging: false,
			image: '/images/marv.jpg',
			victim: 'marv'
		},
		{
			id: 5253,
			name: 'Crowbar to the ribs',
			dragging: false,
			image: '/images/harry.jpg',
			victim: 'harry'
		},
		{
			id: 9496,
			name: 'Falling from the tree house rope',
			dragging: false,
			image: '/images/marv-harry.jpg',
			victim: 'marv-harry'
		}
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

	// Store the original ranking order at the start
	const originalRanking = injuries.map((item) => item.id);

	async function submitRanking() {
		const currentRanking = injuries.map((item) => item.id);

		// Check if the current ranking is the same as the original
		const isRankingUnchanged = JSON.stringify(currentRanking) === JSON.stringify(originalRanking);

		if (isRankingUnchanged) {
			await fetchWorldAverage(); // Show the global rankings
			return;
		}

		// If the ranking has changed, submit it
		const { data, error } = await supabase.from('rankings').insert([{ ranking: currentRanking }]);
		if (error) {
			console.error('Error submitting ranking:', error.message);
			alert('Failed to submit ranking.');
		} else {
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
					image: injuries.find((injury) => injury.id === Number(id))?.image || '',
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
	<aside class="intro">
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
					<img src={injury.image} alt={injury.name} />
					{injury.name}
				</li>
			{/each}
		</ul>
	</section>

	<aside class="submissions">
		{#if !fetchedAverage}
			<button on:click={submitRanking}>Submit your ranking</button>
		{:else}
			<div class="world">
				<h2>How the world judges McCallister</h2>
				<ol>
					{#each averageRankings as ranking}
						<li>
							<img src={ranking.image} alt={ranking.name} />
							{ranking.name}
						</li>
					{/each}
				</ol>
				<p>
					<small>
						Based on {averageRankings.length} submissions as of {new Date().toLocaleString()}.
					</small>
				</p>
			</div>
		{/if}
	</aside>
</main>

<footer>
	<span>
		This site doesn't use any personally identifiable tracking - the source code is
		<a
			href="https://github.com/the-brutality-of-kevin-mccallister/the-brutality-of-kevin-mccallister.github.io"
			target="_blank"
			rel="noopener noreferrer">available here</a
		>
	</span>
	🎅
	<span>Made by <a href="https://superallan.com/">superallan</a></span>
	🎄
	<span><a href="https://codepen.io/radum/pen/xICAB">Snow credits</a></span>
	🎁
	<span>
		<a href="https://codepen.io/adamlindqvist/pen/EaPeJg">Colour credits</a>
	</span>
</footer>

<style>
	:root {
		--alpha: 1;
		--red: hsla(1.7, 74.4%, 45.9%, var(--alpha));
		--green: hsla(142.6, 52.3%, 42.7%, var(--alpha));
		--dark-green: hsla(159, 80.4%, 30%, var(--alpha));
		--text-background: hsla(60, 55.6%, 91.2%, var(--alpha));
		padding: 2rem;
		user-select: none;
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
		@media (min-width: 1000px) {
			grid-template-columns: 2fr 4fr 3fr;
			gap: 2rem;
			.intro,
			.submissions {
				position: sticky;
				inset-block-start: 1rem;
			}
		}
	}
	.intro {
		h1 {
			margin-block-start: 1rem;
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
		margin: 0;
	}
	.yours {
		display: flex;
		flex-direction: column;
		font-size: 1.25rem;
		li {
			padding: 0.5rem 1rem;
			background: var(--text-background);
			box-shadow: 0 0 0.5rem var(--dark-green);
			margin-bottom: 0.5rem;
			font-weight: bold;
			cursor: grab;
			border-radius: 1rem;
			border-width: 0.125rem;
			border-style: solid;
			display: flex;
			align-items: center;
			gap: 1rem;
			img {
				block-size: 3rem;
				border-radius: 0.75rem;
			}
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
	}

	button {
		background-color: var(--dark-green);
		color: var(--text-background);
		font-weight: bold;
		margin-block-start: 1.5rem;
		margin-inline-start: 1.5rem;
		padding: 1rem;
		border: none;
		box-shadow:
			0 0 0 0.5rem var(--green),
			0 0 0 1rem var(--red),
			0 0 0 1.5rem var(--text-background);
		border-radius: 0.5rem;
		cursor: pointer;
		font-size: 1.5rem;
		inline-size: calc(100% - 4.5rem);
	}
	.world {
		background: var(--text-background);
		padding: 2rem;
		border-radius: 0.125rem;
		box-shadow: 0 0 0.5rem var(--dark-green);
		h2 {
			margin-block-start: 0;
		}
		ol {
			margin: 0;
			padding: 0;
			display: grid;
			gap: 1rem 0.75rem;
			grid-template-columns: 1rem 1.5rem auto;
			align-items: center;
		}
		li {
			grid-column: 1/-1;
			display: grid;
			grid-template-columns: subgrid;
			counter-increment: ranking;
			&::before {
				content: counter(ranking) '';
				font-weight: bold;
				text-align: end;
			}
			img {
				inline-size: 1.5rem;
				border-radius: 0.75rem;
			}
			&:nth-child(3n) {
				border-color: var(--red);
			}
			&:nth-child(3n + 1) {
				border-color: var(--dark-green);
			}
			&:nth-child(3n + 2) {
				border-color: var(--green);
			}
		}
	}
	footer {
		margin-block-start: 5rem;
		inline-size: calc(100% - 2rem);
		padding: 1rem;
		background-color: var(--text-background);
		border-radius: 1rem;
		display: inline-flex;
		gap: 1rem;
		a {
			color: var(--dark-green);
			text-decoration: none;
		}
	}
</style>
