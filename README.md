# Adidas Data Mesh: Sharing Data at Scale
![CI](https://github.com/adidas/datamesh-sharing-data-at-scale/actions/workflows/ci-pipeline.yml/badge.svg)


This is the base project we used for sharing at scale in our Data Mesh Journey. You can find all the explantions in this medium [article](https://medium.com/adidoescode/adidas-data-mesh-journey-sharing-data-efficiently-at-scale-c50ee671fbd7)

The project is based on TypeScript and npm workspaces. It uses aws-cdk in order to automate the creation of all infrastructure.

A brief explanation of the project setup:
- common-aws: All common aws things.
- common-utils: All utility functions.
- consumer-journey: The consumer journey Step Function
- data-product-assets-setup: The constructs for the custom resources of the data products.
- data-products-catalogue: The definition of the data products.
- lakeformation-configuration: The needed configuration for enabling lakeformation.
- producer-journey: The producer journey Step Function
- visibility-journey: The visibility journey Step Function

Within those folders you may find the following:
- aws-resoruces: all related aws-cdk code
- xxx-lambda: all related lambda code

The main contributors of this project are: [Ruben](https://github.com/nebur395), [David](https://github.com/fiusa8) and [myself](https://github.com/josete89)
