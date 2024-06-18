// pages/index.tsx
import React, { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'
import axios from 'axios'
import Head from 'next/head'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  LabelList,
  Tooltip as TooltipR,
} from 'recharts'
import styled from '@emotion/styled'
import { Dialog, DialogTitle, DialogContent, IconButton } from '@material-ui/core';
import { Close as CloseIcon } from '@material-ui/icons';

const Grafic = styled.div`

#graficos {
  width: 100%;
  height: 100%;
  display: grid;
}

.graficosClass {
  background: #F1F1F1;
  max-height: 400px; /* Definindo altura máxima para os gráficos */
}

.titleGraphs {
  background: #B70000;
  color: whitesmoke;
  width: 30%;
  align-self: flex-start;
  padding: 2px 0px 2px 0px;
  border-radius: 0px 20px 20px 0px;
  box-shadow: 0px 8px 6px -6px #222;
}

@media (max-width: 768px) {
  #graficos {
    grid-template-columns: 30% 30% 30%; /* Alterando para uma coluna única em telas menores */
  }
  .graficosClass {
    background: #F1F1F1;
    max-height: 400px; /* Definindo altura máxima para os gráficos */
    max-width: 500px;
  }

}

@media (min-width: 900px) and (max-width:1023.98px) {
  #graficos {
    width: 100%;
    height: 100%;
    // grid-template-columns: 33% 33% 33%; /* Alterando para uma coluna única em telas menores */
    }
    .graficosClass {
      background: #F1F1F1;
      min-height: 410px;
      max-height: 600px; /* Definindo altura máxima para os gráficos */
      min-width: 850px;
      max-width: 920px;
    }

    .titleGraphs {
      background: #B70000;
      color: whitesmoke;
      width: 20%;
      align-self: flex-start;
      padding: 2px 0px 2px 0px;
      border-radius: 0px 20px 20px 0px;
      box-shadow: 0px 8px 6px -6px #222;
    }
}

`
const Processo: React.FC = () => {
  const [filtra, setfiltra] = useState([])
  const [graphData, setGraphData] = useState(null);
  const [open, setOpen] = useState(false)

  const { data, isFetching, isStale } = useQuery(
    'Processo', async () => {
      const arr = await axios.get('http://164.152.46.88:3000/api/processo/getalldados').then(response => {
        let dados = []
        let filtra1 = []
        let condic = false
        let anothercondi = false

        dados.filter(item => {
          if (item?.phase === 0) {
            if (anothercondi) condic = true
          } else {
            item.upper_temp = Number(Number(item?.upper_temp).toFixed(3))
            item.lower_temp = Number(Number(item?.lower_temp).toFixed(3))
            item.chimney_temp = Number(Number(item?.chimney_temp).toFixed(3))
            item.aira_ref = Number(Number(item?.aira_ref).toFixed(3))
            item.chimney_temp = Number(Number(item?.chimney_temp).toFixed(2))

            item.timestamp = Number(Number(item?.timestamp).toFixed(3))
            if (item?.upper_temp >= 0 && item?.lower_temp >= 0 && item?.aira_ref >= 0 && item?.timestamp > 94668480) { // filtrar no back
              item["Temperatura x"] = item?.upper_temp
              item["Temperatura y"] = item?.lower_temp
              item["Temperatura z"] = item?.chimney_temp
              item["V. Ar combustão"] = item?.aira_ref
              item.timestamp = (new Date(item?.timestamp * 1000).toLocaleString())
              item.timestamp = item?.timestamp.substring(0, 5) + " " + item?.timestamp.substring(12, 17)
              filtra1.push(item)
              anothercondi = true
              return item
            }
          }
        })
        filtra1.reverse()
        setfiltra(filtra1)
      }).catch(err => {
        throw new Error(err)
      })
      return arr
    }, {
    staleTime: 1000 * 30, // 30 segs
    refetchOnWindowFocus: true,
  }
  )

  const graphExpand = ({ processo }) => {
    setGraphData({
     processo
    });
    setOpen(true);
  }

  return (
    <>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <div style={{ width: '10%',  display: 'flex', flexDirection: 'row', gap: '1000px' }}>
            <span>{graphData && graphData?.Name}</span>
            <IconButton edge="end" color="inherit" onClick={() => setOpen(false)} aria-label="close">
              <CloseIcon />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent>
          {graphData && (
            <>
              <div className='titleGraphs'><strong>Processo {graphData?.processo}</strong></div>
              <ResponsiveContainer width="100%" height={600}>
                <LineChart
                  width={400}
                  height={300}
                  data={filtra?.filter(e => e.processo === graphData?.prcesso)}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 0,
                    bottom: 70,
                  }}
                >
                  <Tooltip />
                  <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" stroke="black" angle={-45} textAnchor="end" />
                    <YAxis unit="°C" stroke="black" domain={[0, 'auto']} />
                    <YAxis unit="%" stroke="black" yAxisId="right" orientation="right" domain={[0, 100]} />
                    <Tooltip />
                    <Legend verticalAlign="top" height={36} />
                    <Line type="monotone" dot={false} isAnimationActive={false} dataKey='Temperatura x' stroke="red" yAxisId={0} />
                    <Line type="monotone" dot={false} isAnimationActive={false} dataKey='Temperatura y' stroke="purple" yAxisId={0} />
                    <Line type="monotone" dot={false} isAnimationActive={false} dataKey='Temperatura z' stroke="blue" yAxisId={0} />
                    <Line type="monotone" dot={false} isAnimationActive={false} dataKey='V. Ar combustão' stroke="black" yAxisId="right" />
                    <Line type="monotone" dot={false} isAnimationActive={false} dataKey='phase' stroke="green" />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Grafic>
        <div style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
          <div className='titleGraphs' style={{ fontWeight: 'bold', fontSize: '20px', fontFamily: 'Helvetica' }}>Gráficos Pirólise</div>
          <span style={{ background: '#799C87', color: 'white', borderRadius: '10px 10px 10px 10px', padding: '4px', boxShadow: '0px 8px 6px -6px #222' }}>UBC 1</span>
        </div>
        <div id='graficos' style={{ height: '100%', marginTop: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: '10px' }}>
            <div id='graficosF1' className='graficosClass' style={{ width: '555px', padding: '25px', marginBottom: '10px', borderRadius: '10px', fontFamily: 'Helvetica' }}
              onClick={() =>
                graphExpand({
                  processo: 1
                })
              }
            >
            <div className='titleGraphs'><strong>Processo 1</strong></div>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  width={570}
                  height={400}
                  data={filtra?.filter(e => e.processo === 1)}
                  margin={{
                    top: 10,
                    right: 1,
                    left: 1,
                    bottom: 50,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" stroke="black" angle={-45} textAnchor="end" />
                  <YAxis unit="°C" stroke="black" domain={[0, 'auto']} />
                  <YAxis unit="%" stroke="black" yAxisId="right" orientation="right" domain={[0, 100]} />
                  <Tooltip />
                  <Legend verticalAlign="top" height={36} />
                  <Line type="monotone" dot={false} isAnimationActive={false} dataKey='Temperatura x' stroke="red" yAxisId={0} />
                  <Line type="monotone" dot={false} isAnimationActive={false} dataKey='Temperatura y' stroke="purple" yAxisId={0} />
                  <Line type="monotone" dot={false} isAnimationActive={false} dataKey='Temperatura z' stroke="blue" yAxisId={0} />
                  <Line type="monotone" dot={false} isAnimationActive={false} dataKey='V. Ar combustão' stroke="black" yAxisId="right" />
                  <Line type="monotone" dot={false} isAnimationActive={false} dataKey='phase' stroke="green" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Grafic>
    </>
  )
}

const Home: React.FC = () => {
  const queryClient = new QueryClient()

  return (
    <div>
      <Head>
        <title>Gráficos Processo</title>
      </Head>
      <QueryClientProvider client={queryClient}>
        <Processo />
      </QueryClientProvider>
    </div>
  );
}

export default Home;
