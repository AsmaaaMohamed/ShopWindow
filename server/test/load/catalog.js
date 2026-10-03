import http from 'k6/http';
import { check } from 'k6';
import { Trend } from 'k6/metrics';

const productListingDuration = new Trend('product_listing_duration');
const productDetailDuration = new Trend('product_detail_duration');

export const options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  const listingResponse = http.get(
    'http://localhost:5000/products?page=1&limit=20',
  );

  productListingDuration.add(listingResponse.timings.duration);

  check(listingResponse, {
    'product listing returns 200': (response) => response.status === 200,
  });

  const detailResponse = http.get(
    'http://localhost:5000/products/cobalt-notebook-x',
  );

  productDetailDuration.add(detailResponse.timings.duration);

  check(detailResponse, {
    'product detail returns 200': (response) => response.status === 200,
  });
}