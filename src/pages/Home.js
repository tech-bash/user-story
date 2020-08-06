import React, { useState, useEffect, useRef } from 'react'
import Button from '../components/Button'
import StoriesList from '../components/StoriesList'
import LoadingIndicator from '../modules/LoadingIndicator'

import axios from 'axios'
import { apiURL } from '../config.json'
import { trackPromise, usePromiseTracker } from 'react-promise-tracker'
import Navigation from '../components/Navigation'
import Pagination from '../components/Pagination'

const stateList = [
  'Under Consideration',
  'Planned',
  'Design in progress',
  'Development in progress',
  'Testing',
  'Launched'
]

const sortByList = ['Most Voted', 'Most Discussed']

const Home = () => {
  const [currentStateSelected, selectState] = useState('Under Consideration')

  const [stories, setStories] = useState([])

  const productDropdownContainer = useRef()
  const sortDropdownContainer = useRef()

  const [productDropdownState, setProductDropdownState] = useState(false)
  const [sortDropdownState, setSortDropdownState] = useState(false)

  const [product, setProduct] = useState('All')
  const [sort, setSort] = useState('Most Voted')

  const [products, setProducts] = useState([])

  const handleProductSelection = (value) => {
    setProduct(value)
    setProductDropdownState(false)
  }

  const handleSortSelection = (value) => {
    setSort(value)
    setSortDropdownState(false)
  }
  const handleProductDropdownState = () => {
    setProductDropdownState(!productDropdownState)
  }
  const handleSortDropdownState = () => {
    setSortDropdownState(!sortDropdownState)
  }

  const { promiseInProgress } = usePromiseTracker()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        productDropdownContainer.current &&
        !productDropdownContainer.current.contains(event.target)
      ) {
        setProductDropdownState(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [productDropdownContainer])
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sortDropdownContainer.current &&
        !sortDropdownContainer.current.contains(event.target)
      ) {
        setSortDropdownState(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [sortDropdownContainer])

  useEffect(() => {
    const fetchStories = async () => {
      const response = await axios.post(
        `${apiURL}/graphql`,
        {
          query: `query {
            userStories(sort: "votes:desc,createdAt:desc") {
              id
              Title
              Description
              user_story_status {
                Status
              }
              user_story_comments {
                Comments
              }
              product {
                Name
              }
              followers {
                username
              }
            }
          }`
        },
        {
          withCredentials: true
        }
      )
      setStories(response.data.data.userStories)
    }
    trackPromise(fetchStories())
    const fetchProducts = async () => {
      const response = await axios.post(
        `${apiURL}/graphql`,
        {
          query: `query {
          products {
            Name
          }
        }`
        },
        {
          withCredentials: true
        }
      )
      setProducts(response.data.data.products)
    }
    trackPromise(fetchProducts())
  }, [])

  useEffect(() => {
    const comparatorVotes = (a, b) => {
      return a.followers.length < b.followers.length
    }
    const comparatorComments = (a, b) => {
      return a.user_story_comments.length < b.user_story_comments.length
    }

    const updateStories = async () => {
      if (sort === 'Most Voted') {
        setStories(stories.sort(comparatorVotes))
      }
      if (sort === 'Most Discussed') {
        setStories(stories.sort(comparatorComments))
      }
    }
    trackPromise(updateStories())
  }, [sort, stories, setStories])

  return (
    <>
      <div className='base-wrapper'>
        <div className='base-container'>
          <Navigation />
          <div className='home-content'>
            <h3>Welcome to EOS User Stories</h3>
            <p>
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s, when an unknown printer took a galley of
              type and scrambled it to make a type specimen book.
            </p>
            {promiseInProgress ? (
              <LoadingIndicator />
            ) : (
              <>
                <div className='flex flex-row'>
                  <div className='filter-title'>Filter by product</div>
                  <div
                    className='dropdown-container'
                    ref={productDropdownContainer}
                  >
                    <Button
                      type='button'
                      className='btn btn-transparent'
                      onClick={handleProductDropdownState}
                    >
                      {productDropdownState ? (
                        <i className='eos-icons'>keyboard_arrow_up</i>
                      ) : (
                        <i className='eos-icons'>keyboard_arrow_down</i>
                      )}
                      &nbsp; {product}
                    </Button>
                    <div
                      className={`dropdown ${
                        productDropdownState
                          ? 'dropdown-open dropdown-right'
                          : 'dropdown-close dropdown-right'
                      }`}
                    >
                      <ul className='dropdown-list'>
                        <li
                          className='dropdown-element'
                          onClick={() => handleProductSelection('All')}
                        >
                          All
                        </li>
                        {products.map((item, key) => (
                          <li
                            key={key}
                            className='dropdown-element'
                            onClick={() => handleProductSelection(item.Name)}
                          >
                            {item.Name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className='filter-title'>Sort by</div>
                  <div
                    className='dropdown-container'
                    ref={sortDropdownContainer}
                  >
                    <Button
                      type='button'
                      className='btn btn-transparent'
                      onClick={handleSortDropdownState}
                    >
                      {sortDropdownState ? (
                        <i className='eos-icons'>keyboard_arrow_up</i>
                      ) : (
                        <i className='eos-icons'>keyboard_arrow_down</i>
                      )}
                      &nbsp; {sort}
                    </Button>
                    <div
                      className={`dropdown ${
                        sortDropdownState
                          ? 'dropdown-open dropdown-right'
                          : 'dropdown-close dropdown-right'
                      }`}
                    >
                      <ul className='dropdown-list'>
                        {sortByList.map((item, key) => (
                          <li
                            key={key}
                            className='dropdown-element'
                            onClick={() => handleSortSelection(item)}
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className='flex flex-row flex-space-between'>
                  {stateList &&
                    stateList.map((state, key) => {
                      return (
                        <Button
                          className={
                            currentStateSelected === state
                              ? 'btn btn-tabs btn-tabs-selected'
                              : 'btn btn-tabs'
                          }
                          key={key}
                          onClick={() => selectState(state)}
                        >
                          {state}
                        </Button>
                      )
                    })}
                </div>
                <StoriesList
                  stories={stories}
                  state={currentStateSelected}
                  product={product}
                />
              </>
            )}
            <Pagination />
          </div>
        </div>
      </div>
    </>
  )
}

export default Home
