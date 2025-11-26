import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 50 },    // sobe até 50 usuários virtuais
    { duration: '20s', target: 200 },   // mantém 200 simultâneos
    { duration: '10s', target: 300 },   // estica até 300 simultâneos
    { duration: '10s', target: 0 },     // volta pra 0
  ],
};

export default function () {
  const res = http.get('https://tuluz-agendamento.vercel.app/');
  check(res, {
    'status 200': (r) => r.status === 200,
  });
  sleep(1);
}
