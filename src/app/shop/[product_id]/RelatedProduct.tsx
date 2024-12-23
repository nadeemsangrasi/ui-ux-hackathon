import LineHead from "@/components/shared/LineHead";
import Product from "@/components/shared/Product";
import Wrapper from "@/components/shared/Wrapper";
import { ourtTopData } from "@/data/data";
import { IProduct } from "@/types/types";
import React from "react";

const RelatedProduct = () => {
  return (
    <>
      <div className="text-center space-y-2 py-16">
        <h2 className="text-[35px] sm:text-[66px] font-semibold">
          Related Products
        </h2>
      </div>
      <div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-center ">
          {ourtTopData.map((product: IProduct, index) => (
            <Product key={index} product={product} />
          ))}
        </div>
      </div>
      <div className="my-10">
        <LineHead label="View More" url="/shop" />
      </div>
    </>
  );
};

export default RelatedProduct;
