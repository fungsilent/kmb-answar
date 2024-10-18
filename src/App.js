import { useState, useEffect } from 'react'

function App() {
  const [keyword, setKeyword] = useState('')
  const [list, setList] = useState([])
  const [routes, setRoutes] = useState([])
  const [route, setRoute] = useState(null)
  const [stops, setStops] = useState([])

  useEffect(() => {
    fetchStopsofRoute()
  }, [route])

  async function fetchStopsofRoute() {
    const api = `
https://data.etabus.gov.hk/v1/transport/kmb`
    if (route) {
      const res = await fetch(`${api}/route-stop/${route.route}/${route.bound}/${route.service_type}`)
      const result = await res.json()
      if(!!result?.data.length) {
        let stopArr = []
        await Promise.all(result.data.map(async ({stop}) => {
          const res = await fetch(`${api}/stop/${stop}`)
          const result = await res.json();
          stopArr.push({
            stopId: stop, 
            stopName: result.data.name_tc
          })
        }))
        setStops(stopArr)
      }
    }
  }

  useEffect(() => {
    fetchAllRoutes()
  }, [])

  async function fetchAllRoutes() {
    const res = await fetch(process.env.REACT_APP_ROUTE_API)
    const result = await res.json()
    setList(result.data)
  }
  function handleRT (stopId) {
    const {route, service_type} = route;
    // route, service_type, stopId => fetch ETA
  }
  function handleUserInput(e) {
    let text = e.target.value.replaceAll(/[^a-zA-Z0-9]/g, '').toUpperCase()
    setKeyword(text)
  } 
  function handleSearch() {
    let routeArr = []
    if (!!list.length) {
      list.map(item => {
        item.route === keyword && routeArr.push(item)
      });
    } 
    setRoutes(routeArr)
  }
  console.log(stops)
  return (
    <div className="container mx-auto mt-2">
      <img 
        src="https://melson.tech/wp-content/uploads/2017/01/KMB-logo.png" 
        width={200}
      />
      <section className="mt-4">
        {/* Input */}
        <input 
          className={'border border-red-400 rounded-md py-1 px-2'}
          onChange={e => handleUserInput(e)}
          value={keyword}
          placeholder={'請輸入路線'}
        />
        <button 
          className={'border rounded-md bg-red-200 py-1 px-2 hover:bg-red-300'}
          onClick={handleSearch}
        >搜尋路線</button>  
      </section>
      <section>
        {/* Route */} 
        {
          !!routes.length && routes.map(({bound, dest_tc, orig_tc, service_type, route}, index) => {
            return <button 
                      key={index}
                      className={'border py-1 px-2 bg-gray-100 rounded-md m-1 hover:bg-gray-200'}
                      onClick={() => setRoute({
                        bound: bound === 'O'? 'outbound' : 'inbound',
                        service_type, // service_type: service_type
                        route, // route: route
                      })}
                    >
                      {`${orig_tc} >> ${dest_tc}`}
                    </button>
          })
        }
      </section> 
      <section>
        {/* Stops */} 
        {
          !!stops.length && stops.map(({stopId, stopName}) => {
            return <div 
                key={stopId}
                onClick={() => handleRT(stopId)} 
              >{stopName}</div>
          })
        } 
      </section>     
    </div>
  );
}

export default App;
