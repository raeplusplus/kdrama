import React, { Component } from "react";
import { Route, BrowserRouter as Router, Switch, Redirect } from "react-router-dom";
import { Header, Filters, Titles, TitleInfo, Footer } from "./components";
import { getTitles, getImage, getTitleInfo, getNetworkInfo } from "./api.js";
import ScrollMemory from 'react-router-scroll-memory';

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const apiKey = process.env.REACT_APP_TMDB_API_KEY;
const discoverAPIurl = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&include_null_first_air_dates=false`;
const titleAPIurl = `https://api.themoviedb.org/3/tv`;
const networkAPIurl = `https://api.themoviedb.org/3/network`;

class App extends Component {
	constructor (props) {
		super(props);
		this.state = {
			display_lang        : "en-US",
			orig_lang           : "ko",
			sort_by             : "popularity.desc",
			genres              : "18",
			air_date_year       : "",
			page                : 1,
			search_query        : "",
			query_titles        : [],
			titles              : [],
			total_pages         : 0,
			total_results       : 0,
			query_total_results : 0
		};
	}

	async componentDidMount () {
		const discoverAPI = `${discoverAPIurl}&language=${this.state.display_lang}&sort_by=${this.state
			.sort_by}&with_genres=${this.state.genres}&with_original_language=${this.state
			.orig_lang}&first_air_date_year=${this.state.air_date_year}&page=${this.state.page}`;
		const apiResult = await getTitles(discoverAPI);
		this.setState({
			titles              : apiResult.results,
			total_pages         : apiResult.total_pages,
			total_results       : apiResult.total_results,
			query_total_results : apiResult.results.length
		});
		this.initialState = this.state;
	}

	resetState = () => {
		this.setState(this.initialState);
	};

	changeSortBy = async (event) => {
		const newSortBy = event.target.value;
		this.setState({
			sort_by : newSortBy,
			page    : 1
		});
		const discoverAPI = `${discoverAPIurl}&language=${this.state
			.display_lang}&sort_by=${newSortBy}&with_genres=${this.state.genres}&with_original_language=${this.state
			.orig_lang}&first_air_date_year=${this.state.air_date_year}&page=1`;
		const apiResult = await getTitles(discoverAPI);
		this.setState({
			titles              : apiResult.results,
			total_pages         : apiResult.total_pages,
			total_results       : apiResult.total_results,
			query_total_results : apiResult.results.length
		});
		this.handleSearch(this.state.search_query, false);
	};

	changeLang = async (event) => {
		const newLang = event.target.value;
		this.setState({
			orig_lang : newLang,
			page      : 1
		});
		const discoverAPI = `${discoverAPIurl}&language=${this.state.display_lang}&sort_by=${this.state
			.sort_by}&with_genres=${this.state.genres}&with_original_language=${newLang}&first_air_date_year=${this
			.state.air_date_year}&page=1`;
		const apiResult = await getTitles(discoverAPI);
		this.setState({
			titles              : apiResult.results,
			total_pages         : apiResult.total_pages,
			total_results       : apiResult.total_results,
			query_total_results : apiResult.results.length
		});
		this.handleSearch(this.state.search_query, false);
	};

	changeYear = async (event) => {
		const newYear = event.target.value;
		this.setState({
			air_date_year : newYear,
			page          : 1
		});
		const discoverAPI = `${discoverAPIurl}&language=${this.state.display_lang}&sort_by=${this.state
			.sort_by}&with_genres=${this.state.genres}&with_original_language=${this.state
			.orig_lang}&first_air_date_year=${newYear}&page=1`;
		const apiResult = await getTitles(discoverAPI);
		this.setState({
			titles              : apiResult.results,
			total_pages         : apiResult.total_pages,
			total_results       : apiResult.total_results,
			query_total_results : apiResult.results.length
		});
		this.handleSearch(this.state.search_query, false);
	};

	handleSearch = (query, nextPage) => {
		const titles = this.state.titles;
		if (query !== "") {
			if (!nextPage) {
				this.setState({ page: 1 });
			}
			const queryTitles = titles.filter(
				(title) =>
					title.name.toLowerCase().includes(query.toLowerCase()) ||
					title.original_name.toLowerCase().includes(query.toLowerCase())
			);
			this.setState({
				search_query        : query,
				query_titles        : queryTitles,
				query_total_results : queryTitles.length
			});
		} else {
			this.setState({
				search_query        : "",
				query_titles        : [],
				query_total_results : titles.length
			});
		}
	};

	nextPage = () => {
		setTimeout(async () => {
			this.setState({ page: this.state.page + 1 });
			const discoverAPI = `${discoverAPIurl}&language=${this.state.display_lang}&sort_by=${this.state
				.sort_by}&with_genres=${this.state.genres}&with_original_language=${this.state
				.orig_lang}&first_air_date_year=${this.state.air_date_year}&page=${this.state.page}`;
			const apiResult = await getTitles(discoverAPI);
			const updatedTitles = [].concat(this.state.titles, apiResult.results);
			this.setState({
				titles              : updatedTitles,
				total_pages         : apiResult.total_pages,
				total_results       : apiResult.total_results,
				query_total_results : updatedTitles.length
			});
			this.handleSearch(this.state.search_query, true);
		}, 500);
	};

	fetchTitleInfo = async (titleId) => {
		const titleAPI = `${titleAPIurl}/${titleId}?api_key=${apiKey}&language=${this.state.display_lang}`;
		return await getTitleInfo(titleAPI);
	};

	fetchNetworkInfo = async (networkId) => {
		const networkAPI = `${networkAPIurl}/${networkId}?api_key=${apiKey}`;
		return await getNetworkInfo(networkAPI);
	};

	render () {
		return (
			<div className="AppComponent text-center">
				<Router>
					<ScrollMemory />
					<Header />
					<Switch>
						<Route exact path="/">
							<Filters
								getState={this.state}
								resetState={this.resetState}
								changeSortBy={this.changeSortBy}
								changeLang={this.changeLang}
								changeYear={this.changeYear}
								handleSearch={this.handleSearch}
							/>
							<Titles
								titles={this.state.titles}
								queryTitles={this.state.query_titles}
								searchQuery={this.state.search_query}
								currentPage={this.state.page}
								totalPages={this.state.total_pages}
								totalResults={this.state.total_results}
								queryTotalResults={this.state.query_total_results}
								getImage={getImage}
								nextPage={this.nextPage}
							/>
						</Route>
						<Route
							exact
							path="/title/:id"
							render={(props) => (
								<TitleInfo
									titleId={props.match.params.id}
									fetchTitleInfo={this.fetchTitleInfo}
									getImage={getImage}
								/>
							)}
						/>
						<Route>
							<Redirect to="/" />
						</Route>
					</Switch>
					<Footer />
				</Router>
			</div>
		);
	}
}

export default App;
