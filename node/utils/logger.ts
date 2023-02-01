export function yellow(text) {
  return `\x1b[33m${text}\x1b[0m`;
}

export function logQuote(
  chain,
  from,
  to,
  token1Value,
  token2Value,
  percentsDifference
) {
  console.log(
    `
    ${yellow(chain)}\t
    pair:${from.name}/${to.name}\t
    value:${token1Value}/${token2Value}\t${percentsDifference}%\t
    ${token1Value > token2Value ? "t1>t2" : "t1<t2"}
    `
  );
}
