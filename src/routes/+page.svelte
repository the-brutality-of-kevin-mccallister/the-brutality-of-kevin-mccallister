<script>
	import { initializeSnowEffect as initSnow } from '$lib/snowfall';
	import { supabase } from '$lib/supabaseClient';
	import Sortable from 'sortablejs';
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
	 * @type {HTMLUListElement}
	 */
	let sortableContainer;

	const submitRanking = async () => {
		const rankingIds = injuries.map((item) => item.id);
		const originalIds = injuries.map((item, index) => index + 1);

		// Check if the ranking is different from the original
		const isDifferent = rankingIds.some((id, index) => id !== originalIds[index]);

		if (!isDifferent) {
			alert('Please change the order before submitting.');
			return;
		}

		const { error } = await supabase.from('rankings').insert([{ ranking: rankingIds }]);

		if (error) {
			console.error('Error submitting ranking:', error.message);
			alert('Failed to submit ranking.');
		} else {
			fetchWorldAverage();
		}
	};

	let fetchedAverage = false;
	let fetchedTotal = 0;

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

			fetchedTotal = data.length;
			fetchedAverage = true;
		}
	}

	// Snow effect logic
	// @ts-ignore
	onMount(() => {
		new Sortable(sortableContainer, {
			animation: 150, // Smooth animation
			handle: 'li', // Handle to drag the element
			// @ts-ignore
			onEnd: (event) => {
				const { oldIndex, newIndex } = event;
				if (oldIndex !== newIndex) {
					const movedItem = injuries.splice(oldIndex, 1)[0];
					injuries.splice(newIndex, 0, movedItem);
				}
			}
		});
		const main = document.querySelector('main');
		initSnow(main);
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
		<p>
			The debate starts here. <a
				href="https://bsky.app/hashtag/theworldjudges"
				target="_blank"
				rel="noopener noreferrer">#theworldjudges</a
			>
		</p>
		<p>
			<strong>
				Drag the attacks in to order of aggression, brutality and overwhelming force, then submit to
				see what the world thinks.
			</strong>
		</p>
	</aside>
	<section class="yours">
		<ul bind:this={sortableContainer}>
			{#each injuries as injury}
				<li>
					<img src={injury.image} alt={injury.name} />
					<span>{injury.name}</span>
					<svg
						class="dragger"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
					>
						<path
							d="M8.5 7C9.32843 7 10 6.32843 10 5.5C10 4.67157 9.32843 4 8.5 4C7.67157 4 7 4.67157 7 5.5C7 6.32843 7.67157 7 8.5 7ZM8.5 13.5C9.32843 13.5 10 12.8284 10 12C10 11.1716 9.32843 10.5 8.5 10.5C7.67157 10.5 7 11.1716 7 12C7 12.8284 7.67157 13.5 8.5 13.5ZM10 18.5C10 19.3284 9.32843 20 8.5 20C7.67157 20 7 19.3284 7 18.5C7 17.6716 7.67157 17 8.5 17C9.32843 17 10 17.6716 10 18.5ZM15.5 7C16.3284 7 17 6.32843 17 5.5C17 4.67157 16.3284 4 15.5 4C14.6716 4 14 4.67157 14 5.5C14 6.32843 14.6716 7 15.5 7ZM17 12C17 12.8284 16.3284 13.5 15.5 13.5C14.6716 13.5 14 12.8284 14 12C14 11.1716 14.6716 10.5 15.5 10.5C16.3284 10.5 17 11.1716 17 12ZM15.5 20C16.3284 20 17 19.3284 17 18.5C17 17.6716 16.3284 17 15.5 17C14.6716 17 14 17.6716 14 18.5C14 19.3284 14.6716 20 15.5 20Z"
						>
						</path>
					</svg>
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
						Based on {fetchedTotal} submissions as of {new Date().toLocaleString()}.
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

		user-select: none;
		font-family: system-ui;
		line-height: 1.4;
		background: repeating-linear-gradient(
			145deg,
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
		padding: 0.5rem;
		gap: 1rem;
		display: grid;
		grid-template-columns: 1fr;
		align-items: start;
		@media (min-width: 1000px) {
			padding: 2rem;
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
			margin-block-end: 0.5rem;
			font-size: 3rem;
			line-height: 0.9;
			text-wrap: balance;
		}
		padding: 0.5rem 1rem;
		background-color: var(--text-background);
		border-radius: 0.125rem;
		box-shadow: 0 0 0.5rem var(--dark-green);
		@media (min-width: 1000px) {
			padding: 1rem 2rem;
		}
	}
	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.yours {
		display: flex;
		flex-direction: column;
		font-size: 1rem;
		@media (min-width: 1000px) {
			font-size: 1.25rem;
		}
		ul {
			display: grid;
			grid-template-columns: auto 1fr auto;
			gap: 0.25rem 1rem;
		}
		li {
			display: grid;
			grid-column: 1/-1;
			grid-template-columns: subgrid;
			align-items: center;
			padding: 0.5rem;
			background: var(--text-background);
			box-shadow: 0 0 0.5rem var(--dark-green);
			font-weight: bold;
			cursor: grab;
			border-radius: 1rem;
			border-width: 0.125rem;
			border-style: solid;
			line-height: 0.9;
			img {
				block-size: 3rem;
				border-radius: 0.75rem;
			}
			.dragger {
				block-size: 1.5rem;
			}
			&:nth-child(3n) {
				border-color: var(--red);
				.dragger {
					color: var(--red);
				}
			}
			&:nth-child(3n + 1) {
				border-color: var(--dark-green);
				.dragger {
					color: var(--dark-green);
				}
			}
			&:nth-child(3n + 2) {
				border-color: var(--green);
				.dragger {
					color: var(--green);
				}
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
		inline-size: calc(100% - 3rem);
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
		text-align: center;
		margin-block-start: 5rem;
		padding: 1rem;
		background-color: var(--text-background);
		border-radius: 1rem;
	}
	a {
		color: var(--dark-green);
		text-decoration: none;
	}
</style>
