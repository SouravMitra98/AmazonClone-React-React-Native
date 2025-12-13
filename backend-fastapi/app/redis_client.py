import redis

redis_client = redis.Redis(
    host="localhost",
    port=6379,
    decode_responses=True,
)


def delete_pattern(pattern: str):
    for key in redis_client.scan_iter(pattern):
        redis_client.delete(key)
