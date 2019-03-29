# -*- coding: utf-8 -*-
import scrapy
from scrapy_redis.spiders import RedisSpider


# class ChinaSpider(RedisSpider):
class ChinaSpider(scrapy.Spider):
    name = 'china'
    allowed_domains = ['99114.com']
    start_urls = ['http://www.99114.com/']

    # redis_key = 'ppdd'

    def parse(self, response):
        item = {}
        a_list = response.xpath('//div[@class="float-layer hide"]//ul/li/a')
        for a in a_list:
            item['url_b'] = a.xpath('./@href').extract_first()
            # print(item)
            yield scrapy.Request(
                item['url_b'],
                callback=self.get_list,
                meta={'item': item}
            )


    def get_list(self, response):
        item = response.meta['item']
        a_list = response.xpath('//a[@class="shopname J_MouseEneterLeave J_ShopInfo"]')
        # 当前页码
        item['page'] = response.xpath('//li[@class="item active"]/span/text()').extract_first()
        for a in a_list:
            # 详情页的url
            item['url_s'] = a.xpath('./@href').extract_first()
            yield scrapy.Request(
                item['url_s'],
                callback=self.get_login,
                meta={'item': item}
            )

        # 下一页请求next_url
        next= response.xpath('//a[@class="J_Ajax num icon-tag"]/@href').extract_first()
        next_url='http://gongying.99114.com'+next
        # print(next_url)
        item['next']=next_url
        if next_url:
            yield scrapy.Request(
                next_url,
                callback=self.get_list,
                meta={'item': item}
            )


    def get_login(self, response):
        item = response.meta['item']
        # 电话　公司　联系人
        item['phone'] = response.xpath('//span[@class="phoneNumber"]/text()').extract_first()
        item['name_s'] = response.xpath('//span[@class="name"]/text()').extract_first()
        item['company'] = response.xpath('//p[@class="companyname"]/span/a/text()').extract_first()
        yield item
        print(item)
