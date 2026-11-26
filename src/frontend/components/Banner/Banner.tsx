// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import Link from 'next/link';
import * as S from './Banner.styled';

const Banner = () => {
  return (
    <S.Banner>
      <S.ImageContainer>
        <S.BannerImg />
      </S.ImageContainer>
      <S.TextContainer>
        <S.Title>Welcome to Stanley Unue Store</S.Title>
        <S.Subtitle>Systems Administrator + Devops Store</S.Subtitle>
        <Link href="#hot-products"><S.GoShoppingButton>Explore the Store</S.GoShoppingButton></Link>
      </S.TextContainer>
    </S.Banner>
  );
};

export default Banner;
