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
import { Button } from '@material-ui/core';
import SearchIcon from '@mui/icons-material/Search';

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
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [filtra, setfiltra] = useState([])

    const handleSearchButtonClick = async () => {
        try {
            await axios.post('http://164.152.46.88:3000/api/processo/search', { dataIni: new Date(startDate).getTime(), dataFim: new Date(endDate).getTime() });
            let dados = [];
            let filtra1 = [];
            let condic = false;
            let anothercondi = false;
            dados.filter(item => {
                if (item?.phase === 0) {
                    if (anothercondi) condic = true;
                } else {
                    item.upper_temp = Number(Number(item?.upper_temp).toFixed(3));
                    item.lower_temp = Number(Number(item?.lower_temp).toFixed(3));
                    item.chimney_temp = Number(Number(item?.chimney_temp).toFixed(3));
                    item.aira_ref = Number(Number(item?.aira_ref).toFixed(3));
                    item.chimney_temp = Number(Number(item?.chimney_temp).toFixed(2));
                    if (item?.upper_temp >= 0 && item?.lower_temp >= 0 && item?.aira_ref >= 0 && 
                        item?.chimney_temp >= 0 && item?.timestamp > 94668480) {
                        item["Temperatura x"] = item?.upper_temp;
                        item["Temperatura y"] = item?.lower_temp;
                        item["Temperatura z"] = item?.chimney_temp;
                        item["V. Ar combustão"] = item?.aira_ref;
                        item.timestamp = (new Date(item?.timestamp * 1000).toLocaleString());
                        item.timestamp = item?.timestamp.substring(0, 5) + " " + item?.timestamp.substring(12, 17);
                        filtra1.push(item);
                        anothercondi = true;
                        return item;
                    }
                }
            });
            filtra1.reverse();
            setfiltra(filtra1);
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        }
    };

    return (
        <>
            <div>
                <h3>
                    <div style={{background:'lightgray'}}>
                        &nbsp;Data de Início:&nbsp;&nbsp;
                        <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        {/* <>{console.log('start', startDate)}</> */}
                        &nbsp;Data de Fim: &nbsp;&nbsp;
                        <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        <Button variant="contained" endIcon={<SearchIcon />} 
                            style={{ color: 'white', background: 'green', padding: '5px', marginLeft: '5px', textAlign: 'initial' }} 
                            onClick={handleSearchButtonClick}>Buscar
                        </Button>
                    </div>
                </h3>
                <LineChart
                    width={1500}
                    height={680}
                    data={filtra}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 30,
                        bottom: 70,
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
            </div>
        </>
    )
}

const Processos: React.FC = () => {
    const queryClient = new QueryClient()

    return (
        <div>
            <Head>
                <title>Histórico Processo</title>
            </Head>
            <QueryClientProvider client={queryClient}>
                <Processo />
            </QueryClientProvider>
        </div>
    );
}

export default Processos;