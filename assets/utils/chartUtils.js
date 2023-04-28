export function* colorGenerator() {
  const colors = [
    '#36a2eb',
    '#ff6384',
    '#ffce56',
    '#ff9f40',
    '#4bc0c0',
    '#99c000',
    '#d0d0d0',
    '#ab2d2d',
    '#587e41',
    '#624691',
    '#d92767',
    '#88e3aa',
  ];

  let i = 0;
  while (true) {
    i = ++i % colors.length;
    yield {
      from: colors[i],
      to: colors[i],
    };
  }
}

export function getChartOptions(title) {
  return {
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: !!title,
        text: title,
      },
    },
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
}
